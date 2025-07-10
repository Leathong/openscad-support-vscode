/*
 *  OpenSCAD Shapes Library (www.openscad.org)
 *  Copyright (C) 2010-2011  Giles Bathgate, Elmo Mäntynen
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License,
 *  LGPL version 2.1, or (at your option) any later version of the GPL.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 *
*/

// 2D regular shapes

module triangle(radius)
{
  o=radius/2;		//equivalent to radius*sin(30)
  a=radius*sqrt(3)/2;	//equivalent to radius*cos(30)
  polygon(points=[[-a,-o],[0,radius],[a,-o]],paths=[[0,1,2]]);
}

module reg_polygon(sides, radius) {
  echo("<font color='red'>
        DEPRECATED: function 'reg_polygon' is now deprecated
        please use 'regular_polygon' instead</font>");

     regular_polygon(sides, radius);
}

module regular_polygon(sides, radius)
{
  function dia(r) = sqrt(pow(r*2,2)/2);  //sqrt((r*2^2)/2) if only we had an exponention op
  if(sides<2) square([radius,0]);
  if(sides==3) triangle(radius);
  if(sides==4) square([dia(radius),dia(radius)],center=true);
  if(sides>4) {
    angles=[ for (i = [0:sides-1]) i*(360/sides) ];
    coords=[ for (th=angles) [radius*cos(th), radius*sin(th)] ];
    polygon(coords);
  }
}

module pentagon(radius)
{
  regular_polygon(5,radius);
}

module hexagon(radius, diameter, across_flats)
{
  r = across_flats ? across_flats/2/cos(30) : diameter ? diameter/2 : radius;
  regular_polygon(6,r);
}

module heptagon(radius)
{
  regular_polygon(7,radius);
}

module octagon(radius)
{
  regular_polygon(8,radius);
}

module nonagon(radius)
{
  regular_polygon(9,radius);
}

module decagon(radius)
{
  regular_polygon(10,radius);
}

module hendecagon(radius)
{
  regular_polygon(11,radius);
}

module dodecagon(radius)
{
  regular_polygon(12,radius);
}

module ring(inside_diameter, thickness){
  difference(){
    circle(r=(inside_diameter+thickness*2)/2);
    circle(r=inside_diameter/2);
  }
}

module ellipse(width, height) {
  scale([1, height/width, 1]) circle(r=width/2);
}

// The ratio of length and width is about 1.39 for a real egg
module egg_outline(width, length){
    translate([0, width/2, 0]) union(){
        rotate([0, 0, 180]) difference(){
            ellipse(width, 2*length-width);
            translate([-length/2, 0, 0]) square(length);
        }
        circle(r=width/2);
    }
}

//3D regular shapes

module cone(height, radius, center = false)
{
  cylinder(height, radius, 0, center);
}

module oval_prism(height, rx, ry, center = false)
{
  scale([1, rx/ry, 1]) cylinder(h=height, r=ry, center=center);
}

module oval_tube(height, rx, ry, wall, center = false)
{
  difference() {
    scale([1, ry/rx, 1]) cylinder(h=height, r=rx, center=center);
    translate([0,0,-height/2]) scale([(rx-wall)/rx, (ry-wall)/rx, 2]) cylinder(h=height, r=rx, center=center);
  }
}

module cylinder_tube(height, radius, wall, center = false)
{
    tubify(radius,wall)
    cylinder(h=height, r=radius, center=center);
}

//Tubifies any regular prism
module tubify(radius,wall)
{
  difference()
  {
    children(0);
    translate([0, 0, -0.1]) scale([(radius-wall)/radius, (radius-wall)/radius, 2]) children(0);
  }
}

module triangle_prism(height,radius)
{
  linear_extrude(height=height) triangle(radius);
}

module triangle_tube(height,radius,wall)
{
   tubify(radius,wall) triangle_prism(height,radius);
}

module pentagon_prism(height,radius)
{
  linear_extrude(height=height) pentagon(radius);
}

module pentagon_tube(height,radius,wall)
{
 tubify(radius,wall) pentagon_prism(height,radius);
}

module hexagon_prism(height, radius, across_flats)
{
  linear_extrude(height=height)
    hexagon(radius=radius, across_flats=across_flats);
}

module hexagon_tube(height,radius,wall)
{
 tubify(radius,wall) hexagon_prism(height,radius);
}

module heptagon_prism(height,radius)
{
  linear_extrude(height=height) heptagon(radius);
}

module heptagon_tube(height,radius,wall)
{
 tubify(radius,wall) heptagon_prism(height,radius);
}

module octagon_prism(height,radius)
{
  linear_extrude(height=height) octagon(radius);
}

module octagon_tube(height,radius,wall)
{
 tubify(radius,wall) octagon_prism(height,radius);
}

module nonagon_prism(height,radius)
{
  linear_extrude(height=height) nonagon(radius);
}

module decagon_prism(height,radius)
{
  linear_extrude(height=height) decagon(radius);
}

module hendecagon_prism(height,radius)
{
  linear_extrude(height=height) hendecagon(radius);
}

module dodecagon_prism(height,radius)
{
  linear_extrude(height=height) dodecagon(radius);
}

module torus(outerRadius, innerRadius)
{
  r=(outerRadius-innerRadius)/2;
  rotate_extrude() translate([innerRadius+r,0,0]) circle(r);
}

module torus2(r1, r2)
{
  rotate_extrude() translate([r1,0,0]) circle(r2);
}

module oval_torus(inner_radius, thickness=[0, 0])
{
  rotate_extrude() translate([inner_radius+thickness[0]/2,0,0]) ellipse(width=thickness[0], height=thickness[1]);
}


module triangle_pyramid(radius)
{
  o=radius/2;		//equivalent to radius*sin(30)
  a=radius*sqrt(3)/2;	//equivalent to radius*cos(30)
  polyhedron(points=[[-a,-o,-o],[a,-o,-o],[0,radius,-o],[0,0,radius]],triangles=[[0,1,2],[1,2,3],[0,1,3],[0,2,3]]);
}

module square_pyramid(base_x, base_y,height)
{
  w=base_x/2;
  h=base_y/2;
  polyhedron(points=[[-w,-h,0],[-w,h,0],[w,h,0],[w,-h,0],[0,0,height]],triangles=[[0,3,2,1], [0,1,4], [1,2,4], [2,3,4], [3,0,4]]);
}

module egg(width, length){
    rotate_extrude()
        difference(){
            egg_outline(width, length);
            translate([-length, 0, 0]) cube(2*length, center=true);
        }
}

// Tests:

test_square_pyramid(){square_pyramid(10, 20, 30);}
