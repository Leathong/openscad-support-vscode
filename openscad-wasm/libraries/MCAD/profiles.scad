// ==============================================
// Miscellaneous profiles (aluminum etc)
// By Vitaly Mankevich / contraptor.org, (c) 2012
// LGPL 2.1
// ==============================================
//
// PROFILES (DIMENSIONLESS UNLESS SPECIFIED)
// -----------------------------------------
// profile_angle_equal(1, 1/8);
// profile_angle_unequal(1, 1/2, 1/16);
// profile_square_tube(1.5, 1/8);
// profile_rect_tube(1.5, 2, 1/8);
// profile_channel(1.5, 1, 1/8);
//
// profile_8020_fractional_1010(); // inches
// profile_misumi_metric_2020(); // millimeters
// profile_makerbeam();  // millimeters
//
// EXTRUDED PROFILES
// -----------------
// linear_extrude (height = 3.5) profile_square_tube(1.5, 1/8);
//

$fn = 24;

module profile_angle_equal(side, wall) {
	difference () {
		square (side);
		translate([wall, wall, 0]) square (side - wall);
	}
}

module profile_angle_unequal(side_x, side_y, wall) {
	difference () {
		square ([side_x, side_y]);
		translate ([wall, wall, 0]) square ([side_x - wall, side_y - wall]);
	}
}

module profile_square_tube(side, wall) {
	difference () {
		square (side, center = true);
		square (side-wall*2, center = true);
	}
}

module profile_rect_tube(side_x, side_y, wall) {
	difference () {
		square ([side_x, side_y], center = true);
		square ([side_x - wall*2, side_y - wall*2], center = true);
	}
}

module profile_channel(base, side, wall) {
	translate ([0, side/2, 0]) difference () {
		square ([base, side], center = true);
		translate ([0, wall/2, 0]) square ([base - wall*2, side - wall], center = true);
	}
}

module profile_tslot_generic (pitch, slot, lip, web, core, hole) {
	// pitch = side width, slot = slot width, lip = thickness of the lip, web = thickness of the web, core = side of the center square, hole = center hole diameter
	difference () {
		union() {
			difference () {
				square (pitch, center=true);
				square (pitch - lip*2, center=true);
				square ([pitch, slot], center=true);
				square ([slot, pitch], center=true);
			}
			rotate ([0, 0, 45]) square ([pitch*1.15, web], center=true);
			rotate ([0, 0, -45]) square ([pitch*1.15, web], center=true);
			square (core, center=true);
		}
		circle (hole/2);
	}
}

module profile_8020_fractional_1010 () {
	profile_tslot_generic (pitch = 1, slot = 0.26, lip = 0.1, web = 0.13, core = 0.45, hole = 0.28);
}

module profile_misumi_metric_2020 () {
	profile_tslot_generic (pitch = 20, slot = 5.2, lip = 2, web = 2.6, core = 9, hole = 5.6);
}

module profile_makerbeam () {
	profile_tslot_generic (pitch = 10, slot = 2.5, lip = 1, web = 2, core = 1, hole = 0);
}
