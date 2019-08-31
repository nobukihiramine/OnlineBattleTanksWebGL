class SpriteBatcher
{
    // コンストラクタ
    constructor( gl, iMaxSprite )
    {
        this.sprites = new Sprites( gl, iMaxSprite );
        this.iCountSprite = 0;

        // １スプライトは、四角形の４頂点を保持。１頂点は、４座標値（x, y, tx, ty）
        this.afValueBuffer = new Array( iMaxSprite * 4 * 4 );
    }

    beginBatch()
    {
        this.iCountSprite = 0;
    }

    endBatch( gl,
        textureinfo,
        uniformlocation_Texture )
    {
        textureinfo.bind( gl );

        // テクスチャの転送（第２引数は、テクスチャユニット番号。「gl.activeTexture()」で指定したのテクスチャユニット番号を指定する）
        gl.uniform1i( uniformlocation_Texture, 0 );

        if( 0 !== this.iCountSprite )
        {
            this.sprites.setVertices( gl, this.afValueBuffer );
            this.sprites.bind( gl );
            this.sprites.draw( gl, gl.TRIANGLES, this.iCountSprite );
            this.sprites.unbind( gl );
        }

        textureinfo.unbind( gl );
        // texture.bind( gl ); に対する修了処理として、texture.unbind( gl ); を呼び出す。
        // 上記を呼び出さない場合の不具合として、
        // スプライトバッチャーを用いた描画後に、テクスチャを利用しない図形を描画した際に、
        // バインドされているテクスチャを用いた描画が行われ、意図しない描画結果となる。
    }

    drawSprite0( fLeft,   // 描画先領域の左下座標
                 fBottom, // 描画先領域の左下座標
                 fRight,  // 描画先領域の右上座標
                 fTop,    // 描画先領域の右上座標
                 rectTextureRegion )
    {
        this.afValueBuffer[this.iCountSprite * 16 + 0] = fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 1] = fBottom;
        this.afValueBuffer[this.iCountSprite * 16 + 2] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 3] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 4] = fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 5] = fBottom;
        this.afValueBuffer[this.iCountSprite * 16 + 6] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 7] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 8] = fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 9] = fTop;
        this.afValueBuffer[this.iCountSprite * 16 + 10] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 11] = rectTextureRegion.fTop;

        this.afValueBuffer[this.iCountSprite * 16 + 12] = fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 13] = fTop;
        this.afValueBuffer[this.iCountSprite * 16 + 14] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 15] = rectTextureRegion.fTop;

        this.iCountSprite++;
    }

    drawSprite1( fX,      // 描画先領域の中心座標
                 fY,      // 描画先領域の中心座標
                 fWidth,  // 描画先領域のサイズ
                 fHeight, // 描画先領域のサイズ
                 rectTextureRegion )
    {
        const fHalfWidth = fWidth * 0.5;
        const fHalfHeight = fHeight * 0.5;

        const fLeft = fX - fHalfWidth;
        const fBottom = fY - fHalfHeight;
        const fRight = fX + fHalfWidth;
        const fTop = fY + fHalfHeight;

        this.afValueBuffer[this.iCountSprite * 16 + 0] = fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 1] = fBottom;
        this.afValueBuffer[this.iCountSprite * 16 + 2] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 3] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 4] = fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 5] = fBottom;
        this.afValueBuffer[this.iCountSprite * 16 + 6] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 7] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 8] = fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 9] = fTop;
        this.afValueBuffer[this.iCountSprite * 16 + 10] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 11] = rectTextureRegion.fTop;

        this.afValueBuffer[this.iCountSprite * 16 + 12] = fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 13] = fTop;
        this.afValueBuffer[this.iCountSprite * 16 + 14] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 15] = rectTextureRegion.fTop;

        this.iCountSprite++;
    }

    drawSprite2( fX,      // 描画先領域の中心座標
                 fY,      // 描画先領域の中心座標
                 fWidth,  // 描画先領域のサイズ
                 fHeight, // 描画先領域のサイズ
                 fAngle,  // 描画先領域の回転角度
                 rectTextureRegion )
    {
        const fHalfWidth = fWidth * 0.5;
        const fHalfHeight = fHeight * 0.5;

        const fCos = Math.cos( fAngle );
        const fSin = Math.sin( fAngle );

        // 左下を回転
        const fX1 = fX + ( -fHalfWidth ) * fCos - ( -fHalfHeight ) * fSin;
        const fY1 = fY + ( -fHalfWidth ) * fSin + ( -fHalfHeight ) * fCos;
        // 右下を回転
        const fX2 = fX + ( fHalfWidth ) * fCos - ( -fHalfHeight ) * fSin;
        const fY2 = fY + ( fHalfWidth ) * fSin + ( -fHalfHeight ) * fCos;
        // 右上を回転
        const fX3 = fX + ( fHalfWidth ) * fCos - ( fHalfHeight ) * fSin;
        const fY3 = fY + ( fHalfWidth ) * fSin + ( fHalfHeight ) * fCos;
        // 左上を回転
        const fX4 = fX + ( -fHalfWidth ) * fCos - ( fHalfHeight ) * fSin;
        const fY4 = fY + ( -fHalfWidth ) * fSin + ( fHalfHeight ) * fCos;

        this.afValueBuffer[this.iCountSprite * 16 + 0] = fX1;
        this.afValueBuffer[this.iCountSprite * 16 + 1] = fY1;
        this.afValueBuffer[this.iCountSprite * 16 + 2] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 3] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 4] = fX2;
        this.afValueBuffer[this.iCountSprite * 16 + 5] = fY2;
        this.afValueBuffer[this.iCountSprite * 16 + 6] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 7] = rectTextureRegion.fBottom;

        this.afValueBuffer[this.iCountSprite * 16 + 8] = fX3;
        this.afValueBuffer[this.iCountSprite * 16 + 9] = fY3;
        this.afValueBuffer[this.iCountSprite * 16 + 10] = rectTextureRegion.fRight;
        this.afValueBuffer[this.iCountSprite * 16 + 11] = rectTextureRegion.fTop;

        this.afValueBuffer[this.iCountSprite * 16 + 12] = fX4;
        this.afValueBuffer[this.iCountSprite * 16 + 13] = fY4;
        this.afValueBuffer[this.iCountSprite * 16 + 14] = rectTextureRegion.fLeft;
        this.afValueBuffer[this.iCountSprite * 16 + 15] = rectTextureRegion.fTop;

        this.iCountSprite++;
    }

}
