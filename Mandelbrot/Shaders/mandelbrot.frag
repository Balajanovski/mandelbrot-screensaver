#version 440 core

out vec4 FragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform int zoomPointSeed;
uniform int selectedPalette;

#define fragCoord (gl_FragCoord.xy)

// Math constants
#define M_PI 3.1415926535897932384626433832795

#define AA 2

const float MAX_ITERATIONS = 200;	// Maximum iterations for mandelbrot point.
const float B = 256.0;				// Threshold radius where if point escapes it will not return. Calculated according to: http://iquilezles.org/www/articles/mset_1bulb/mset1bulb.htm

// Smooth iteration count algorithm from: http://iquilezles.org/www/articles/mset_smooth/mset_smooth.htm
float iterateMandelbrot( in vec2 c ) {
    float n = 0.0;
    vec2 z = vec2(0.0); // Complex number to be iterated
    for( int i = 0; i < MAX_ITERATIONS; ++i ) {
        z = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y ) + c; // z = z² + c : The mandelbrot equation
        if( dot(z,z)>(B*B) ) {							// Orbit exit
			break;
		}
        n += 1.0;
    }

    float sn = n - log2(log2(dot(z,z))) + 4.0;  // Smooth iteration count formula
    
    return sn;
}

vec3 palette1(float iter) {
	return 0.5 + 0.5*cos( 3.0 + iter*0.15 + vec3(0.0, 0.6, 1.0));
}

vec3 palette2(float iter) {
	return 0.5 + 0.5*cos( 3.0 + iter*0.15 + vec3(1.0, 1.0, 0.0));
}

vec3 palette3(float iter) {
	return 0.5 + 0.5*cos( 3.0 + iter*0.15 + vec3(1.0, 0.0, 1.0));
}

vec3 palette4(float iter) {
	return 0.5 + 0.5*cos( 3.0 + iter*0.15 + vec3(1.0, 0.5, 0.0));
}

vec3 palette5(float iter) {
	vec3 col1 = 0.5 + 0.5*sin( 3.0 + 4.0*iter + vec3(0.0,0.5,1.0) );
	vec3 col2 = 0.5 + 0.5*sin( 4.1 + 2.0*iter + vec3(1.0,0.5,0.0) );
	return 2.0*sqrt(col1*col2);
}

vec3 palette6(float iter) {
	return mix(vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), clamp(iter / MAX_ITERATIONS, 0.0, 1.0));
}

vec3 palette(float iter) {
	if (selectedPalette == 1) {
		return palette1(iter);
	} else if (selectedPalette == 2) {
		return palette2(iter);
	} else if (selectedPalette == 3) {
		return palette3(iter);
	} else if (selectedPalette == 4) {
		return palette4(iter);
	} else if (selectedPalette == 5) {
		return palette5(iter);
	} else if (selectedPalette == 6) {
		return palette6(iter);
	} else {
		return palette1(iter); // Default to palette 1 if the selected palette does not match any of the others
	}
}

struct FractalZoomPoint {
	vec2 point;
	float zoom;
};

const int NUM_FRACTAL_ZOOM_POINTS = 5;
const FractalZoomPoint fractalZoomingPathway[NUM_FRACTAL_ZOOM_POINTS] = {{vec2(0.29068872044367683,0.013983731568809773), 0.69}, {vec2(-1.7111699654622743,-0.00005396519659936117), 0.69}, {vec2(-0.745,0.186), 0.62}, {vec2(-0.243681, 0.7553695), 0.7}, {vec2(-0.1602984475374732,1.0341274089935764), 0.79}};
const float zoomFrequencyModifier = 0.07;

void main() {
	vec3 color = vec3(0.0);

	for (int m = 0; m < AA; ++m) {
		for (int n = 0; n < AA; ++n) {
			int currentZoomPointIndex = int(mod((iTime / (2 * M_PI / zoomFrequencyModifier)) + zoomPointSeed, NUM_FRACTAL_ZOOM_POINTS));
			FractalZoomPoint currZoomPoint = fractalZoomingPathway[currentZoomPointIndex];

			
			vec2 screenPos = (-iResolution.xy + 2.0*(fragCoord.xy + vec2(float(m), float(n)) / float(AA)))/iResolution.y;
	
			// Compute zoom level into fractal
			float zoom = currZoomPoint.zoom + (1.0 - currZoomPoint.zoom)*cos(zoomFrequencyModifier * iTime);
			zoom = pow(zoom, 8.0);

			// Rotate point
			float coa = cos(0.05*(1.0 - currZoomPoint.zoom) * iTime);
			float sia = sin(0.05*(1.0 - currZoomPoint.zoom) * iTime);
			vec2 rotatedPoint = vec2(screenPos.x*coa - screenPos.y*sia, screenPos.x*sia + screenPos.y*coa);

			// Compute complez number C, to start iterating on according to z = z² + c aka the mandelbrot equation
			vec2 c = currZoomPoint.point + rotatedPoint * zoom;
	
			float iter = iterateMandelbrot(c);
	
			color += palette(iter); // Color the fractal
			
		}
	}
	color /= float(AA * AA);
	
	FragColor = vec4(color, 1.0);
}
