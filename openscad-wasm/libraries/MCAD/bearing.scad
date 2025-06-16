/*
 * Bearing model.
 *
 * Originally by Hans Häggström, 2010.
 * Dual licenced under Creative Commons Attribution-Share Alike 3.0 and LGPL2 or later
 */

/*
change list 13/6/2013
 added ,604,606,607,628,629,6200,6201,6202,6203,6205,6206   bearing sizes 
*/

include <units.scad>
include <materials.scad>

// Example, uncomment to view
//test_bearing();
//test_bearing_hole();

module test_bearing(){
    bearing();
    bearing(pos=[5*cm, 0,0], angle=[90,0,0]);
    bearing(pos=[-2.5*cm, 0,0], model=688);
}

module test_bearing_hole(){
    difference(){
      cube(size=[30, 30, 7-10*epsilon], center=true);
      bearing(outline=true, center=true);
    }
}

BEARING_INNER_DIAMETER = 0;
BEARING_OUTER_DIAMETER = 1;
BEARING_WIDTH = 2;

// Common bearing names
SkateBearing = 608;

// Bearing dimensions
// model == XXX ? [inner dia, outer dia, width]:
// http://www.gizmology.net/bearings.htm has some valuable information on that
// https://www.bearingworks.com/bearing-sizes has a very exhaustive table of dimensions
function bearingDimensions(model) =
  model == 603 ? [3*mm,  9*mm,  5*mm]:
  model == 604 ? [4*mm, 12*mm,  4*mm]:
  model == 605 ? [5*mm, 14*mm,  5*mm]:
  model == 606 ? [6*mm, 17*mm,  6*mm]:
  model == 607 ? [7*mm, 19*mm,  6*mm]:
  model == 608 ? [8*mm, 22*mm,  7*mm]:
  model == 609 ? [9*mm, 24*mm,  7*mm]:

  model == 623 ? [3*mm, 10*mm,  4*mm]:
  model == 624 ? [4*mm, 13*mm,  5*mm]:
  model == 625 ? [5*mm, 16*mm,  5*mm]:
  model == 626 ? [6*mm, 19*mm,  6*mm]:
  model == 627 ? [7*mm, 22*mm,  7*mm]:
  model == 628 ? [8*mm, 24*mm,  8*mm]:
  model == 629 ? [9*mm, 26*mm,  8*mm]:

  model == 633 ? [3*mm, 13*mm,  5*mm]:
  model == 634 ? [4*mm, 16*mm,  5*mm]:
  model == 635 ? [5*mm, 19*mm,  6*mm]:
  model == 636 ? [6*mm, 22*mm,  7*mm]:
  model == 637 ? [7*mm, 26*mm,  9*mm]:
  model == 638 ? [8*mm, 28*mm,  9*mm]:
  model == 639 ? [9*mm, 30*mm, 10*mm]:

  model == 673 ? [3*mm,  6*mm,  2.5*mm]:
  model == 674 ? [4*mm,  7*mm,  2.5*mm]:
  model == 675 ? [5*mm,  8*mm,  2.5*mm]:
  model == 676 ? [6*mm, 10*mm,  3*mm]:
  model == 677 ? [7*mm, 11*mm,  3*mm]:
  model == 678 ? [8*mm, 12*mm,  3.5*mm]:

  model == 683 ? [3*mm,  7*mm,  3*mm]:
  model == 684 ? [4*mm,  9*mm,  4*mm]:
  model == 685 ? [5*mm, 11*mm,  5*mm]:
  model == 686 ? [6*mm, 13*mm,  5*mm]:
  model == 687 ? [7*mm, 14*mm,  5*mm]:
  model == 688 ? [8*mm, 16*mm,  5*mm]:
  model == 689 ? [9*mm, 17*mm,  5*mm]:

  model == 692 ? [2*mm, 6*mm, 3*mm]:
  model == 693 ? [3*mm,  8*mm,  4*mm]:
  model == 694 ? [4*mm, 11*mm,  4*mm]:
  model == 695 ? [5*mm, 13*mm,  4*mm]:
  model == 696 ? [6*mm, 15*mm,  5*mm]:
  model == 697 ? [7*mm, 17*mm,  5*mm]:
  model == 698 ? [8*mm, 19*mm,  6*mm]:
  model == 699 ? [9*mm, 20*mm,  6*mm]:

  model == 6000 ? [10*mm, 26*mm, 8*mm]:
  model == 6001 ? [12*mm, 28*mm, 8*mm]:
  model == 6002 ? [15*mm, 32*mm, 9*mm]:
  model == 6003 ? [17*mm, 35*mm, 10*mm]:
  model == 6004 ? [20*mm, 42*mm, 12*mm]:
  model == 6005 ? [25*mm, 47*mm, 12*mm]:
  model == 6006 ? [30*mm, 55*mm, 13*mm]:
  model == 6007 ? [35*mm, 62*mm, 14*mm]:
  model == 6008 ? [40*mm, 68*mm, 15*mm]:
  model == 6009 ? [45*mm, 75*mm, 16*mm]:
  model == 6010 ? [50*mm, 80*mm, 16*mm]:
  model == 6011 ? [55*mm, 90*mm, 18*mm]:
  model == 6012 ? [60*mm, 95*mm, 18*mm]:
  model == 6013 ? [65*mm, 100*mm, 18*mm]:
  model == 6014 ? [70*mm, 110*mm, 20*mm]:
  model == 6015 ? [75*mm, 115*mm, 20*mm]:

  model == 6200 ? [10*mm, 30*mm, 9*mm]:
  model == 6201 ? [12*mm, 32*mm, 10*mm]:
  model == 6202 ? [15*mm, 35*mm, 11*mm]:
  model == 6203 ? [17*mm, 40*mm, 12*mm]:
  model == 6204 ? [20*mm, 47*mm, 14*mm]:
  model == 6205 ? [25*mm, 52*mm, 15*mm]:
  model == 6206 ? [30*mm, 62*mm, 16*mm]:
  model == 6207 ? [35*mm, 72*mm, 17*mm]:
  model == 6208 ? [40*mm, 80*mm, 18*mm]:
  model == 6209 ? [45*mm, 85*mm, 19*mm]:

  model == 6300 ? [10*mm, 35*mm, 11*mm]:
  model == 6301 ? [12*mm, 37*mm, 12*mm]:
  model == 6302 ? [15*mm, 42*mm, 13*mm]:
  model == 6303 ? [17*mm, 47*mm, 14*mm]:
  model == 6304 ? [20*mm, 52*mm, 15*mm]:
  model == 6305 ? [25*mm, 62*mm, 17*mm]:
  model == 6306 ? [30*mm, 72*mm, 19*mm]:
  model == 6307 ? [35*mm, 80*mm, 21*mm]:
  model == 6308 ? [40*mm, 90*mm, 23*mm]:
  model == 6309 ? [45*mm, 100*mm, 25*mm]:
  model == 6310 ? [50*mm, 110*mm, 27*mm]:
  model == 6311 ? [55*mm, 120*mm, 29*mm]:
  model == 6312 ? [60*mm, 130*mm, 31*mm]:
  model == 6313 ? [65*mm, 140*mm, 33*mm]:
  model == 6314 ? [70*mm, 150*mm, 35*mm]:
  model == 6315 ? [75*mm, 160*mm, 37*mm]:

  model == 6700 ? [10*mm, 15*mm, 4*mm]:
  model == 6701 ? [12*mm, 18*mm, 4*mm]:
  
  model == 6808 ? [40*mm, 52*mm, 7*mm]:

  model == 6900 ? [10*mm, 22*mm, 6*mm]:
  model == 6901 ? [12*mm, 24*mm, 6*mm]:
  model == 6902 ? [15*mm, 28*mm, 7*mm]:
  model == 6903 ? [17*mm, 30*mm, 7*mm]:
  model == 6904 ? [20*mm, 37*mm, 9*mm]:
  model == 6905 ? [25*mm, 42*mm, 9*mm]:

  model == "LM12" ? [12*mm, 21*mm, 30*mm]:

  model == "MR52" ? [2*mm, 5*mm, 2.5*mm]:
  model == "MR62" ? [2*mm, 6*mm, 2.5*mm]:
  model == "MR63" ? [3*mm, 6*mm, 2.5*mm]:
  model == "MR72" ? [2*mm, 7*mm, 3*mm]:
  model == "MR74" ? [4*mm, 7*mm, 2.5*mm]:
  model == "MR83" ? [3*mm, 8*mm, 3*mm]:
  model == "MR84" ? [4*mm, 8*mm, 3*mm]:
  model == "MR85" ? [5*mm, 8*mm, 2.5*mm]:
  model == "MR93" ? [3*mm, 9*mm, 4*mm]:
  model == "MR95" ? [5*mm, 9*mm, 3*mm]:
  model == "MR104" ? [4*mm, 10*mm, 4*mm]:
  model == "MR105" ? [5*mm, 10*mm, 4*mm]:
  model == "MR106" ? [6*mm, 10*mm, 3*mm]:
  model == "MR115" ? [5*mm, 11*mm, 4*mm]:
  model == "MR117" ? [7*mm, 11*mm, 3*mm]:
  model == "MR126" ? [6*mm, 12*mm, 4*mm]:
  model == "MR128" ? [8*mm, 12*mm, 3.5*mm]:
  model == "MR137" ? [7*mm, 13*mm, 4*mm]:
  model == "MR148" ? [8*mm, 14*mm, 4*mm]:
  model == "MR149" ? [9*mm, 14*mm, 4.5*mm]:
  [8*mm, 22*mm, 7*mm]; // this is the default


function bearingWidth(model) = bearingDimensions(model)[BEARING_WIDTH];
function bearingInnerDiameter(model) = bearingDimensions(model)[BEARING_INNER_DIAMETER];
function bearingOuterDiameter(model) = bearingDimensions(model)[BEARING_OUTER_DIAMETER];

module bearing(pos=[0,0,0], angle=[0,0,0], model=SkateBearing, outline=false,
                material=Steel, sideMaterial=Brass, center=false) {
  // Common bearing names
  model =
    model == "Skate" ? 608 :
    model;

  w = bearingWidth(model);
  innerD = outline==false ? bearingInnerDiameter(model) : 0;
  outerD = bearingOuterDiameter(model);

  innerRim = innerD + (outerD - innerD) * 0.2;
  outerRim = outerD - (outerD - innerD) * 0.2;
  midSink = w * 0.1;
  newpos = [pos[0], pos[1], center ? pos[2]-(w/2) : pos[2]];

  translate(newpos) rotate(angle) union() {
    color(material)
      difference() {
        // Basic ring
        Ring([0,0,0], outerD, innerD, w, material, material);

        if (outline==false) {
          // Side shields
          Ring([0,0,-epsilon], outerRim, innerRim, epsilon+midSink, sideMaterial, material);
          Ring([0,0,w-midSink], outerRim, innerRim, epsilon+midSink, sideMaterial, material);
        }
      }
  }

  module Ring(pos, od, id, h, material, holeMaterial) {
    color(material) {
      translate(pos)
        difference() {
          cylinder(r=od/2, h=h,  $fs = 0.01);
          color(holeMaterial)
            translate([0,0,-10*epsilon])
              cylinder(r=id/2, h=h+20*epsilon,  $fs = 0.01);
        }
    }
  }

}


