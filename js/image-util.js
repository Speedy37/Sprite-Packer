/**
 * See LICENSE file.
 */

TP.ImageUtil= {};

(function() {

    TP.ImageUtil.createAlphaSpriteSheet= function(maxAlpha, minAlpha, sheetSize, image, bg_fill_style ) {

        if ( maxAlpha<minAlpha ) {
            var t= maxAlpha;
            maxAlpha= minAlpha;
            minAlpha= t;
        }

        var canvas= document.createElement('canvas');
        canvas.width= image.width;
        canvas.height= image.height*sheetSize;
        var ctx= canvas.getContext('2d');
        ctx.fillStyle = bg_fill_style ? bg_fill_style : 'rgba(255,255,255,0)';
        ctx.fillRect(0,0,image.width,image.height*sheetSize);

        var i;
        for( i=0; i<sheetSize; i++ ) {
            ctx.globalAlpha= 1-(maxAlpha-minAlpha)/sheetSize*(i+1);
            ctx.drawImage(image, 0, i*image.height);
        }

        return canvas;
    };

    /**
     * Remove an image's padding transparent border.
     * Transparent means that every scan pixel is alpha=0.
     * @param image
     * @param threshold {number} any value below or equal to this will be optimized.
     */
    TP.ImageUtil.optimize= function(image, threshold) {
        threshold>>=0;

        var canvas= document.createElement('canvas');
        canvas.width= image.width;
        canvas.height=image.height;
        var ctx= canvas.getContext('2d');

        ctx.fillStyle='rgba(0,0,0,0)';
        ctx.fillRect(0,0,image.width,image.height);
        ctx.drawImage( image, 0, 0 );

        var imageData= ctx.getImageData(0,0,image.width,image.height);
        var data= imageData.data;

        var i,j;
        var miny= canvas.height, maxy=0;
        var minx= canvas.width, maxx=0;

        var alpha= false;
        for( i=0; i<canvas.height; i++ ) {
            for( j=0; j<canvas.width; j++ ) {
                if ( data[i*canvas.width*4 + 3+j*4]>threshold ) {
                    alpha= true;
                    break;
                }
            }

            if ( alpha ) {
                break;
            }
        }
        // i contiene el indice del ultimo scan que no es transparente total.
        miny= i;

        alpha= false;
        for( i=canvas.height-1; i>=miny; i-- ) {
            for( j=3; j<canvas.width*4; j+=4 ) {
                if ( data[i*canvas.width*4 + 3+j*4]>threshold ) {
                    alpha= true;
                    break;
                }
            }

            if ( alpha ) {
                break;
            }
        }
        maxy= i;


        alpha= false;
        for( j=0; j<canvas.width; j++ ) {
            for( i=0; i<canvas.height; i++ ) {
                if ( data[i*canvas.width*4 + 3+j*4 ]>threshold ) {
                    alpha= true;
                    break;
                }
            }
            if ( alpha ) {
                break;
            }
        }
        minx= j;

        alpha= false;
        for( j=canvas.width-1; j>=minx; j-- ) {
            for( i=0; i<canvas.height; i++ ) {
                if ( data[i*canvas.width*4 + 3+j*4 ]>threshold ) {
                    alpha= true;
                    break;
                }
            }
            if ( alpha ) {
                break;
            }
        }
        maxx= j;

        if ( 0===minx && 0===miny && canvas.width-1===maxx && canvas.height-1===maxy ) {
            return canvas;
        }

        var width= maxx-minx+1;
        var height=maxy-miny+1;
        var id2= ctx.getImageData( minx, miny, width, height );

        canvas.width= width;
        canvas.height= height;
        ctx= canvas.getContext('2d');
        ctx.putImageData( id2, 0, 0 );

        return canvas;
    };

    TP.ImageUtil.createThumb= function(image, w, h, best_fit) {
        w= w||24;
        h= h||24;
        var canvas= document.createElement('canvas');
        canvas.width= w;
        canvas.height= h;
        var ctx= canvas.getContext('2d');

        if ( best_fit ) {
            var max= Math.max( image.width, image.height );
            var ww= image.width/max*w;
            var hh= image.height/max*h;
            ctx.drawImage( image, (w-ww)/2,(h-hh)/2,ww,hh );
        } else {
            ctx.drawImage( image, 0, 0, w, h );
        }

        return canvas;
    };

})();