class TextureInfo
{
    // コンストラクタ
    constructor( gl, strFileName )
    {
        this.strFileName = strFileName;
        this.iWidth = 0;
        this.iHeight = 0;
        this.texture = null;

        this.load( gl );
    }

    // テクスチャ読み込み
    load( gl )
    {
        this.texture = gl.createTexture();
        // 画像の読み込みが完了するまでの描画のために、1ピクセルの画像をテクスチャとしてセットする。
        this.iWidth = 1;
        this.iHeight = 1;
        gl.bindTexture( gl.TEXTURE_2D, this.texture );   // テクスチャのバインド
        gl.texImage2D( gl.TEXTURE_2D,
            0,  //  level of detail. Level 0 is the base image level and level n is the nth mipmap reduction level.
            gl.RGBA,    // internalFormat,
            this.iWidth,  // width,
            this.iHeight,  // height,
            0,  // border,
            gl.RGBA,    // srcFormat,
            gl.UNSIGNED_BYTE,   // srcType
            new Uint8Array( [255, 255, 255, 255] ) );   // pixel: 読み込みが完了するまでは、白色テクスチャを使う
        gl.bindTexture( gl.TEXTURE_2D, null );   // テクスチャのバインドの解除

        const image = new Image();
        image.onload =
            () =>
            {   // 画像の読み込みが完了した時の処理
                this.iWidth = image.width;
                this.iHeight = image.width;
                gl.bindTexture( gl.TEXTURE_2D, this.texture );
                gl.texImage2D( gl.TEXTURE_2D,
                    0,  //  level of detail. Level 0 is the base image level and level n is the nth mipmap reduction level.
                    gl.RGBA,    // internalFormat,
                    gl.RGBA,    // srcFormat,
                    gl.UNSIGNED_BYTE,   // srcType
                    image );    // ImageData

                if( isPowerOfTwo( image.width ) && isPowerOfTwo( image.height ) )
                {   // 縦も横も２のべき乗である場合
                    gl.generateMipmap( gl.TEXTURE_2D );
                    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ); // 横方向の繰り返しの禁止
                    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ); // 縦方向の繰り返しの禁止
                    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );    // gl.LINEARもしくはgl.NEAREST。gl.XXX_MIPMAP_XXXは不可。
                    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );    // gl.LINEARもしくはgl.NEAREST。gl.XXX_MIPMAP_XXXは不可。
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );    // gl.LINEARもしくはgl.NEAREST。gl.XXX_MIPMAP_XXXは不可。
                }
                else
                {   // 縦もしくは横が２のべき乗でない場合
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ); // 横方向の繰り返しの禁止
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ); // 縦方向の繰り返しの禁止
                    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );    // gl.LINEARもしくはgl.NEAREST。gl.XXX_MIPMAP_XXXは不可。
                }
                gl.bindTexture( gl.TEXTURE_2D, null );   // テクスチャのバインド解除
            };
        image.src = this.strFileName;
    }

    bind(  gl )
    {
        gl.bindTexture( gl.TEXTURE_2D, this.texture );   // テクスチャのバインド
    }

    unbind( gl )
    {
        gl.bindTexture( gl.TEXTURE_2D, null );  // テクスチャのバインドの解除
    }

    // テクスチャ領域の座標値は、ピクセル座標ではなく、テクスチャ座標値として保持しておく。
    // テクスチャ座標値は、画像の左上は (0, 0) 右下は (1.0, 1.0)。
    // 左 = (テクスチャ中の左の座標[ピクセル]) / (テクスチャの幅　[ピクセル])
    // 上 = (テクスチャ中の上の座標[ピクセル]) / (テクスチャの高さ[ピクセル])
    // 右 = 左のテクスチャ座標 + (テクスチャ中の使用する幅　[ピクセル]) / (テクスチャの幅　[ピクセル])
    // 下 = 上のテクスチャ座標 + (テクスチャ中の使用する高さ[ピクセル]) / (テクスチャの高さ[ピクセル])
    createTextureRegion( iLeft,
        iTop,
        iWidth,
        iHeight )
    {
        return new Rect( iLeft / this.iWidth,
            ( iTop + iHeight ) / this.iHeight,
            ( iLeft + iWidth ) / this.iWidth,
            iTop / this.iHeight );
    }
}

