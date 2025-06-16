// Library: boxes.scad
// Version: 1.0
// Author: Marius Kintel
// Copyright: 2010
// License: 2-clause BSD License (http://opensource.org/licenses/BSD-2-Clause)

// 
// roundedCube([x, y, z], r, sidesonly=true/false, center=true/false);
// roundedCube(x, r, sidesonly=true/false, center=true/false);

// EXAMPLE USAGE:
// roundedCube([20, 30, 40], 5, true, true);

// Only for backwards compatibility with existing scripts, (always centered, radius instead of consistent "r" naming.
module roundedBox(size, radius, sidesonly)
{
  echo("WARNING: roundedBox(size, radius, sidesonly) is deprecated, use roundedCube(size, r, sidesonly, center)");
  roundedCube(size, radius, sidesonly, true);
}

// New implementation
module roundedCube(size, r, sidesonly, center) {
  s = is_list(size) ? size : [size,size,size];
  translate(center ? -s/2 : [0,0,0]) {
    if (sidesonly) {
      hull() {
        translate([     r,     r]) cylinder(r=r, h=s[2]);
        translate([     r,s[1]-r]) cylinder(r=r, h=s[2]);
        translate([s[0]-r,     r]) cylinder(r=r, h=s[2]);
        translate([s[0]-r,s[1]-r]) cylinder(r=r, h=s[2]);
      }
    }
    else {
      hull() {
        translate([     r,     r,     r]) sphere(r=r);
        translate([     r,     r,s[2]-r]) sphere(r=r);
        translate([     r,s[1]-r,     r]) sphere(r=r);
        translate([     r,s[1]-r,s[2]-r]) sphere(r=r);
        translate([s[0]-r,     r,     r]) sphere(r=r);
        translate([s[0]-r,     r,s[2]-r]) sphere(r=r);
        translate([s[0]-r,s[1]-r,     r]) sphere(r=r);
        translate([s[0]-r,s[1]-r,s[2]-r]) sphere(r=r);
      }
    }
  }
}
