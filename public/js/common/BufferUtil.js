class BufferUtil
{
    // バッファーの作成
    static makeByteBuffer( iCount )
    {
        return new Uint8Array( iCount );
    }

    static makeShortBuffer( iCount )
    {
        return new Uint16Array( iCount );
    }

    static makeFloatBuffer( iCount )
    {
        return new Float32Array( iCount );
    }

    // バッファーにデータ設定
    static setByteBuffer( byteBuffer, abyteData, iOffset )
    {
        byteBuffer.set( abyteData, iOffset );
    }

    static setShortBuffer( shortBuffer, ashortData, iOffset )
    {
        shortBuffer.set( ashortData, iOffset );
    }

    static setFloatBuffer( floatBuffer, afloatData, iOffset )
    {
        floatBuffer.set( afloatData, iOffset );
    }
}
