/*
 *  OpenSCAD Shapes Library (www.openscad.org)
 *  Copyright (C) 2009  Catarina Mota
 *  Copyright (C) 2010  Elmo Mäntynen
 *
 *  License: LGPL 2.1 or later
*/

include <units.scad>

/*
2D Shapes
ngon(sides, radius, center=false);

3D Shapes
box(width, height, depth);
roundedBox(width, height, depth, radius);
cone(height, radius);
ellipticalCylinder(width, height, depth);
ellipsoid(width, height);
tube(height, radius, wall, center = false);
tube2(height, ID, OD, center = false);
ovalTube(width, height, depth, wall, center = false);
hexagon(height, depth);
octagon(height, depth);
dodecagon(height, depth);
hexagram(height, depth);

rightTriangle(adjacent, opposite, depth);
equiTriangle(side, depth);
12ptStar(height, depth);
*/

//----------------------

echo_deprecated_shapes_library();

module echo_deprecated_shapes_library() {
     echo("<font color='red'>
           DEPRECATED: 'shapes' library is now deprecated
           please use 'regular_shapes' instead</font>");
}

// size is a vector [w, h, d]
module box(width, height, depth) {
  echo_deprecated_shapes_library();
  cube([width, height, depth], true);
}

// size is a vector [w, h, d]
module roundedBox(width, height, depth, radius) {
  echo_deprecated_shapes_library();
  size=[width, height, depth];
  cube(size - [2*radius,0,0], true);
  cube(size - [0,2*radius,0], true);
  for (x = [radius-size[0]/2, -radius+size[0]/2],
       y = [radius-size[1]/2, -radius+size[1]/2]) {
    translate([x,y,0]) cylinder(r=radius, h=size[2], center=true);
  }
}

module cone(height, radius, center = false) {
  echo_deprecated_shapes_library();
  cylinder(height, radius, 0, center);
}

module ellipticalCylinder(w,h, height, center = false) {
  echo_deprecated_shapes_library();
  scale([1, h/w, 1]) cylinder(h=height, r=w, center=center);
}

module ellipsoid(w, h, center = false) {
  echo_deprecated_shapes_library();
  scale([1, h/w, 1]) sphere(r=w/2, center=center);
}

// wall is wall thickness
module tube(height, radius, wall, center = false) {
  echo_deprecated_shapes_library();
  linear_extrude (height = height, center = center) {
    difference() {
      circle(r = radius);
      circle(r = radius - wall);
    }
  }
  difference() {
    cylinder(h=height, r=radius, center=center);
    translate([0,0,-epsilon])
      cylinder(h=height+2*epsilon, r=radius-wall, center=center);
  }
}

module tube2(height, ID, OD, center = false) {
  tube(height = height, center = center, radius = OD / 2, wall = (OD - ID)/2);
}

// wall is wall thickness
module ovalTube(height, rx, ry, wall, center = false) {
  echo_deprecated_shapes_library();
  difference() {
    scale([1, ry/rx, 1]) cylinder(h=height, r=rx, center=center);
    scale([(rx-wall)/rx, (ry-wall)/rx, 1]) cylinder(h=height, r=rx, center=center);
  }
}

// size is the XY plane size, height in Z
module hexagon(size, height) {
  echo_deprecated_shapes_library();
  boxWidth = size/1.75;
  for (r = [-60, 0, 60])
    rotate([0,0,r])
      cube([boxWidth, size, height], true);
}

// size is the XY plane size, height in Z
module octagon(size, height) {
  echo_deprecated_shapes_library();
  intersection() {
    cube([size, size, height], true);
    rotate([0,0,45])
      cube([size, size, height], true);
  }
}

// size is the XY plane size, height in Z
module dodecagon(size, height) {
  echo_deprecated_shapes_library();
  intersection() {
    hexagon(size, height);
    rotate([0,0,90]) hexagon(size, height);
  }
}

// size is the XY plane size, height in Z
module hexagram(size, height) {
  echo_deprecated_shapes_library();
  boxWidth=size/1.75;
  for (v = [[0,1],[0,-1],[1,-1]]) {
    intersection() {
      rotate([0,0,60*v[0]]) cube([size, boxWidth, height], true);
      rotate([0,0,60*v[1]]) cube([size, boxWidth, height], true);
    }
  }
}

module rightTriangle(adjacent, opposite, height) {
  echo_deprecated_shapes_library();
  difference() {
    translate([-adjacent/2,opposite/2,0])
      cube([adjacent, opposite, height], true);
    translate([-adjacent,0,0]) {
      rotate([0,0,atan(opposite/adjacent)])
        dislocateBox(adjacent*2, opposite, height+2);
    }
  }
}

module equiTriangle(side, height) {
  echo_deprecated_shapes_library();
  difference() {
    translate([-side/2,side/2,0]) cube([side, side, height], true);
    rotate([0,0,30]) dislocateBox(side*2, side, height);
    translate([-side,0,0]) {
      rotate([0,0,60]) dislocateBox(side*2, side, height);
    }
  }
}

module 12ptStar(size, height) {
  echo_deprecated_shapes_library();
  starNum = 3;
  starAngle = 90/starNum;
  for (s = [1:starNum]) {
    rotate([0, 0, s*starAngle]) cube([size, size, height], true);
  }
}

//-----------------------
//MOVES THE ROTATION AXIS OF A BOX FROM ITS CENTER TO THE BOTTOM LEFT CORNER
module dislocateBox(w, h, d) {
  translate([0,0,-d/2]) cube([w,h,d]);
}
