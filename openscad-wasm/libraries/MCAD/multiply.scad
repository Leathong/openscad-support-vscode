/*
 * Multiplication along certain curves
 *
 * Copyright by Elmo Mäntynen, 2012.
 * Licenced under LGPL2 or later
 */

include <units.scad>

use <utilities.scad>

// Copy everything $no of times around an $axis, spread over $angle
// If $strict==true or $angle==360, then spacing will leave an empty at $angle,
//  otherwise, $no will be distributed so first is at 0deg, last copy at $angle degrees
// NOTE: $axis works (rotates around that axis), but pass parameter as lower case string
//  eg: "x", "y", or "z". Alternatively, use units.scad vector definitions: X, Y, Z
module spin(no, angle=360, axis=Z, strict=false){
    divisor = (strict || angle==360) ? no : no-1;
    for (i = [0:no-1])
        rotate(normalized_axis(axis)*angle*i/divisor)
            children();
}

// Make a copy of children by rotating around $axis by 180 degrees
module duplicate(axis=Z) spin(no=2, axis=axis) children();

// Make $no copies along the $axis, separated by $separation
module linear_multiply(no, separation, axis=Z)
    for (i = [0:no-1])
        translate(i*separation*normalized_axis(axis)) children();
