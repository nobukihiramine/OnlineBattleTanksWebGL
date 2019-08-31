class Sprites
{
    // コンストラクタ
    constructor( gl, iCountSprite )
    {
        const iCountVertex = iCountSprite * 4; // 頂点数（１スプライトは４点）
        const iCountIndex = iCountSprite * 6; // インデックス数（１スプライトは、６インデックス（012230））

        // バッファオブジェクトの生成
        this.bufferVertexArray = gl.createBuffer();
        this.bufferIndexArray = gl.createBuffer();

        // 頂点バッファーの生成
        const iCountVertexValue = ( 2 + 2 ); // x, y | tx, ty
        this.iStride = iCountVertexValue * Constants.SIZEOF_FLOAT;
        this.floatbufferVertices = BufferUtil.makeFloatBuffer( iCountVertex * iCountVertexValue );
        
        // インデックスバッファーの生成
        this.shortbufferIndices = BufferUtil.makeShortBuffer( iCountIndex );
        // １スプライトは、６インデックス（012230）
        const asIndex = new Array( iCountIndex );
        for( let iIndexSprite = 0; iIndexSprite < iCountSprite; iIndexSprite++ )
        {
            asIndex[iIndexSprite * 6 + 0] = iIndexSprite * 4 + 0;
            asIndex[iIndexSprite * 6 + 1] = iIndexSprite * 4 + 1;
            asIndex[iIndexSprite * 6 + 2] = iIndexSprite * 4 + 2;
            asIndex[iIndexSprite * 6 + 3] = iIndexSprite * 4 + 2;
            asIndex[iIndexSprite * 6 + 4] = iIndexSprite * 4 + 3;
            asIndex[iIndexSprite * 6 + 5] = iIndexSprite * 4 + 0;
        }
        this.setIndices( gl, asIndex );
    }

    setVertices( gl, afVertex )
    {
        BufferUtil.setFloatBuffer( this.floatbufferVertices, afVertex, 0 );

        // 頂点配列のバインド
        gl.bindBuffer( gl.ARRAY_BUFFER, this.bufferVertexArray );

        // データのグラフィックスメモリへの転送
        gl.bufferData( gl.ARRAY_BUFFER, this.floatbufferVertices, gl.STATIC_DRAW );  // 32ビットfloat型データ配列を生成

        // バッファのバインドの解除
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
    }

    setIndices( gl, asIndex )
    {
        BufferUtil.setShortBuffer( this.shortbufferIndices, asIndex, 0 );

        // 頂点配列のバインド
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.bufferIndexArray );

        // データのグラフィックスメモリへの転送
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.shortbufferIndices, gl.STATIC_DRAW );  // 32ビットfloat型データ配列を生成

        // バッファのバインドの解除
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
    }

    draw( gl,
        iPrimitiveType,
        iCountSprite )
    {
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.bufferIndexArray ); // インデックスバッファのバインド
        gl.drawElements( iPrimitiveType, // 描画タイプ
            iCountSprite * 6, // 描画頂点番号数
            gl.UNSIGNED_SHORT, // データタイプ
            0 ); // オフセット
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null ); // インデックスバッファのバインドの解除
    }

    bind( gl )
    {
        // 頂点配列のバインド
        gl.bindBuffer( gl.ARRAY_BUFFER, this.bufferVertexArray );

        // 頂点座標値
        // バインドされているバッファを、頂点バッファオブジェクトの頂点属性にバインドし、そのレイアウトを指定します。
        gl.enableVertexAttribArray( Constants.ATTRIBLOCATION_POSITION );    // 座標値属性を有効にする
        gl.vertexAttribPointer( Constants.ATTRIBLOCATION_POSITION, // シェーダープログラム中の頂点属性の場所
            2,          // データの次元（x,y）
            gl.FLOAT,   // データ型
            false,  // normalize. データ型がgl.FLOATの場合は、効果なし。falseを指定する。
            this.iStride,   // stride,
            0 );    // offset

        // テクスチャ座標値
        gl.enableVertexAttribArray( Constants.ATTRIBLOCATION_TEXCOORD );    // テクスチャ座標値属性配列を有効にする
        gl.vertexAttribPointer( Constants.ATTRIBLOCATION_TEXCOORD, // シェーダープログラム中の頂点属性の場所
            2,          // データの次元（tx,ty）
            gl.FLOAT,   // データ型
            false,  // normalize. データ型がgl.FLOATの場合は、効果なし。falseを指定する。
            this.iStride,   // stride,
            2 * Constants.SIZEOF_FLOAT ); // offset. x, y, tx・・・

        // バッファのバインドの解除
        gl.bindBuffer( gl.ARRAY_BUFFER, null );
    }

    unbind( gl )
    {
        gl.disableVertexAttribArray( Constants.ATTRIBLOCATION_POSITION );    // 座標値属性配列を無効にする
        gl.disableVertexAttribArray( Constants.ATTRIBLOCATION_TEXCOORD );    // テクスチャ座標値属性配列を無効にする
    }
}

