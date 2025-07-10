import { Document, NodeIO, Accessor, Primitive } from '@gltf-transform/core';
import { Light as LightDef, KHRLightsPunctual } from '@gltf-transform/extensions';

export type Vertex = {
    x: number;
    y: number;
    z: number;
}

export type Color = [number, number, number, number];

export type Face = {
    vertices: [number, number, number];
    colorIndex: number;
}

export type IndexedPolyhedron = {
    vertices: Vertex[];
    faces: Face[];
    colors: Color[];
}

export const DEFAULT_FACE_COLOR: Color = [0xf9 / 255, 0xd7 / 255, 0x2c / 255, 1];

type Geom = {
    positions: Float32Array;
    indices: Uint32Array;
    colors?: Float32Array;
};

function createPrimitive(doc: Document, baseColorFactor: Color, {positions, indices, colors}: Geom): Primitive {
    const prim = doc.createPrimitive()
        .setMode(Primitive.Mode.TRIANGLES)
        .setMaterial(
            doc.createMaterial()
                .setDoubleSided(true)
                .setAlphaMode(baseColorFactor[3] < 1 ? 'BLEND' : 'OPAQUE')
                .setMetallicFactor(0.0)
                .setRoughnessFactor(0.8)
                .setBaseColorFactor(baseColorFactor))
        .setAttribute('POSITION',
            doc.createAccessor()
                .setType(Accessor.Type.VEC3)
                .setArray(positions))
        .setIndices(
            doc.createAccessor()
                .setType(Accessor.Type.SCALAR)
                .setArray(indices));
    if (colors) {
        prim.setAttribute('COLOR_0',
            doc.createAccessor()
                .setType(Accessor.Type.VEC3)
                .setArray(colors));
    }
    return prim;
}

function getGeom(data: IndexedPolyhedron): Geom {
    let positions = new Float32Array(data.vertices.length * 3);
    const indices = new Uint32Array(data.faces.length * 3);

    const addedVertices = new Map<number, number>();
    let verticesAdded = 0;
    const addVertex = (i: number) => {
        let index = addedVertices.get(i);
        if (index === undefined) {
            const offset = verticesAdded * 3;
            const vertex = data.vertices[i];
            positions[offset] = vertex.x;
            positions[offset + 1] = vertex.y;
            positions[offset + 2] = vertex.z;
            index = verticesAdded++;
            addedVertices.set(i, index);
        }
        return index;
    };

    data.faces.forEach((face, i) => {
        const { vertices } = face;
        if (vertices.length < 3) throw new Error('Face must have at least 3 vertices');

        const offset = i * 3;
        indices[offset] = addVertex(vertices[0]);
        indices[offset + 1] = addVertex(vertices[1]);
        indices[offset + 2] = addVertex(vertices[2]);
    });
    return {
        positions: positions.slice(0, verticesAdded * 3),
        indices
    };
}

export async function exportGlb(data: IndexedPolyhedron, defaultColor: Color = DEFAULT_FACE_COLOR): Promise<Uint8Array> {
    const doc = new Document();
    const lightExt = doc.createExtension(KHRLightsPunctual);
    doc.createBuffer();

    const scene = doc.createScene()
        .addChild(doc.createNode()
            .setExtension('KHR_lights_punctual', lightExt
                .createLight()
                .setType(LightDef.Type.DIRECTIONAL)
                .setIntensity(1.0)
                .setColor([1.0, 1.0, 1.0]))
            .setRotation([-0.3250576, -0.3250576, 0, 0.8880739]))
        .addChild(doc.createNode()
            .setExtension('KHR_lights_punctual', lightExt
                .createLight()
                .setType(LightDef.Type.DIRECTIONAL)
                .setIntensity(1.0)
                .setColor([1.0, 1.0, 1.0]))
            .setRotation([0.6279631, 0.6279631, 0, 0.4597009]));
            ;

    const mesh = doc.createMesh();

    const facesByColor = new Map<number, Face[]>();
    data.faces.forEach(face => {
        let faces = facesByColor.get(face.colorIndex);
        if (!faces) facesByColor.set(face.colorIndex, faces = []);
        faces.push(face);
    });
    for (let [colorIndex, faces] of facesByColor.entries()) {
        let color = data.colors[colorIndex];
        mesh.addPrimitive(
            createPrimitive(doc, color, getGeom({ vertices: data.vertices, faces, colors: data.colors })));
    }
    scene.addChild(doc.createNode().setMesh(mesh));

    return await new NodeIO().registerExtensions([KHRLightsPunctual]).writeBinary(doc);
}

export function parseOff(content: string): IndexedPolyhedron {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
    
    if (lines.length === 0) throw new Error('Empty OFF file');

    let counts: string;
    let currentLine = 0;
    if (lines[0].match(/^OFF(\s|$)/)) {
        counts = lines[0].substring(3).trim();
        currentLine = 1;
    } else if (lines[currentLine] === 'OFF' && lines.length > 1) {
        counts = lines[1];
        currentLine = 2;
    } else {
        throw new Error('Invalid OFF file: missing OFF header');
    }

    const [numVertices, numFaces] = counts.split(/\s+/).map(Number);
    if (isNaN(numVertices) || isNaN(numFaces)) throw new Error('Invalid OFF file: invalid vertex or face counts');

    if (currentLine + numVertices + numFaces > lines.length) throw new Error('Invalid OFF file: not enough lines');

    const vertices: Vertex[] = [];
    for (let i = 0; i < numVertices; i++) {
        const parts = lines[currentLine + i].split(/\s+/).map(Number);
        if (parts.length < 3 || parts.some(isNaN)) throw new Error(`Invalid OFF file: invalid vertex at line ${currentLine + i + 1}`);
        vertices.push({ x: parts[0], y: parts[1], z: parts[2] });
    }
    currentLine += numVertices;

    const colors: Color[] = [];
    const colorMap = new Map<string, number>();

    const faces: Face[] = [];
    for (let i = 0; i < numFaces; i++) {
        const parts = lines[currentLine + i].split(/\s+/).map(Number);
        const numVerts = parts[0];
        const vertices = parts.slice(1, numVerts + 1);
        const color = parts.length >= numVerts + 4
            ? parts.slice(numVerts + 1, numVerts + 5).map(c => c / 255) as [number, number, number, number]
            : DEFAULT_FACE_COLOR;
        if (vertices.length < 3) throw new Error(`Invalid OFF file: face at line ${currentLine + i + 1} must have at least 3 vertices`);

        const colorKey = color ? color.join(',') : '';
        let colorIndex = colorMap.get(colorKey);
        if (colorIndex == null) {
            colorIndex = colors.length;
            const [r, g, b, a] = color;
            colors.push([r, g, b, a ?? 1]);
            colorMap.set(colorKey, colorIndex);
        }

        if (vertices.length == 3) {
            faces.push({
                vertices: vertices as [number, number, number],
                colorIndex
            });
        } else {
            // Triangulate the face
            for (let j = 1; j < vertices.length - 1; j++) {
                faces.push({
                    vertices: [vertices[0], vertices[j], vertices[j + 1]],
                    colorIndex
                });
            }   
        }
    }

    return { vertices, faces, colors };
}
