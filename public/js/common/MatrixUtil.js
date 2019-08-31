// 行列に関する関数クラス
/*GLの行列データは、列優先の配列。
    [0][4][8][12]
    [1][5][9][13]
    [2][6][10][14]
    [3][7][11][15]*/

const EPSILON = 0.000001;	// 微小値

class MatrixUtil
{
    // 行列の作成
    static createMatrix()
    {
        const f16Out = new Array( 16 );
        this.identityMatrix( f16Out );
        return f16Out;
    }

    // 行列の単位行列化
    static identityMatrix( f16Out )
    {
        f16Out[0] = 1.0; f16Out[4] = 0.0; f16Out[8] = 0.0; f16Out[12] = 0.0;
        f16Out[1] = 0.0; f16Out[5] = 1.0; f16Out[9] = 0.0; f16Out[13] = 0.0;
        f16Out[2] = 0.0; f16Out[6] = 0.0; f16Out[10] = 1.0; f16Out[14] = 0.0;
        f16Out[3] = 0.0; f16Out[7] = 0.0; f16Out[11] = 0.0; f16Out[15] = 1.0;
        return f16Out;
    }

    // 等角投影変換行列：glOrtho()と同内容の行列を生成する
    static createOrthoMatrix( fLeft, fRight, fBottom, fTop, fZnear, fZfar )
    {
        const f16Out = this.createMatrix();

        const fTX = - ( fRight + fLeft ) / ( fRight - fLeft );
        const fTY = - ( fTop + fBottom ) / ( fTop - fBottom );
        const fTZ = - ( fZfar + fZnear ) / ( fZfar - fZnear );

        f16Out[0] = 2 / ( fRight - fLeft ); f16Out[4] = 0.0; f16Out[8] = 0.0; f16Out[12] = fTX;
        f16Out[1] = 0.0; f16Out[5] = 2 / ( fTop - fBottom ); f16Out[9] = 0.0; f16Out[13] = fTY;
        f16Out[2] = 0.0; f16Out[6] = 0.0; f16Out[10] = -2 / ( fZfar - fZnear ); f16Out[14] = fTZ;
        f16Out[3] = 0.0; f16Out[7] = 0.0; f16Out[11] = 0.0; f16Out[15] = 1.0;
        return f16Out;
    }

    // 透視投影変換行列：gluPerspective()と同内容の行列を生成する
    static createPerspectiveMatrix( fFovy, fAspect, fNear, fFar )
    {
        const f16Out = this.createMatrix();

        const f = 1.0 / Math.tan( fFovy / 2 );

        f16Out[0] = f / fAspect; f16Out[4] = 0; f16Out[8] = 0; f16Out[12] = 0;
        f16Out[1] = 0; f16Out[5] = f; f16Out[9] = 0; f16Out[13] = 0;
        f16Out[2] = 0; f16Out[6] = 0; f16Out[10] = ( fFar + fNear ) / ( fNear - fFar ); f16Out[14] = 2 * fFar * fNear / ( fNear - fFar );
        f16Out[3] = 0; f16Out[7] = 0; f16Out[11] = -1; f16Out[15] = 0;

        return f16Out;
    }

    static translate( f16InOut, v )
    {
        const fX = v[0];
        const fY = v[1];
        const fZ = v[2];
        f16InOut[12] = f16InOut[0] * fX + f16InOut[4] * fY + f16InOut[8] * fZ + f16InOut[12];
        f16InOut[13] = f16InOut[1] * fX + f16InOut[5] * fY + f16InOut[9] * fZ + f16InOut[13];
        f16InOut[14] = f16InOut[2] * fX + f16InOut[6] * fY + f16InOut[10] * fZ + f16InOut[14];
        f16InOut[15] = f16InOut[3] * fX + f16InOut[7] * fY + f16InOut[11] * fZ + f16InOut[15];
    }

    static rotate( f16InOut, rad, axis )
    {
        let fAxisX = axis[0];
        let fAxisY = axis[1];
        let fAxisZ = axis[2];
        let fLen = Math.sqrt( fAxisX * fAxisX + fAxisY * fAxisY + fAxisZ * fAxisZ );
        if( EPSILON > Math.abs( fLen ) )
        {   // 回転軸の指定が不正
            return null;
        }

        // 回転軸を単位化
        fLen = 1.0 / fLen;
        fAxisX *= fLen;
        fAxisY *= fLen;
        fAxisZ *= fLen;

        // 一時変数
        let fSin = Math.sin( rad );
        let fCos = Math.cos( rad );
        let fCos2 = 1 - fCos;

        const a00 = f16InOut[0]; const a01 = f16InOut[1]; const a02 = f16InOut[2]; const a03 = f16InOut[3];
        const a10 = f16InOut[4]; const a11 = f16InOut[5]; const a12 = f16InOut[6]; const a13 = f16InOut[7];
        const a20 = f16InOut[8]; const a21 = f16InOut[9]; const a22 = f16InOut[10]; const a23 = f16InOut[11];

        // Construct the elements of the rotation matrix
        const b00 = fAxisX * fAxisX * fCos2 + fCos; const b01 = fAxisY * fAxisX * fCos2 + fAxisZ * fSin; const b02 = fAxisZ * fAxisX * fCos2 - fAxisY * fSin;
        const b10 = fAxisX * fAxisY * fCos2 - fAxisZ * fSin; const b11 = fAxisY * fAxisY * fCos2 + fCos; const b12 = fAxisZ * fAxisY * fCos2 + fAxisX * fSin;
        const b20 = fAxisX * fAxisZ * fCos2 + fAxisY * fSin; const b21 = fAxisY * fAxisZ * fCos2 - fAxisX * fSin; const b22 = fAxisZ * fAxisZ * fCos2 + fCos;

        // Perform rotation-specific matrix multiplication
        f16InOut[0] = a00 * b00 + a10 * b01 + a20 * b02;
        f16InOut[1] = a01 * b00 + a11 * b01 + a21 * b02;
        f16InOut[2] = a02 * b00 + a12 * b01 + a22 * b02;
        f16InOut[3] = a03 * b00 + a13 * b01 + a23 * b02;
        f16InOut[4] = a00 * b10 + a10 * b11 + a20 * b12;
        f16InOut[5] = a01 * b10 + a11 * b11 + a21 * b12;
        f16InOut[6] = a02 * b10 + a12 * b11 + a22 * b12;
        f16InOut[7] = a03 * b10 + a13 * b11 + a23 * b12;
        f16InOut[8] = a00 * b20 + a10 * b21 + a20 * b22;
        f16InOut[9] = a01 * b20 + a11 * b21 + a21 * b22;
        f16InOut[10] = a02 * b20 + a12 * b21 + a22 * b22;
        f16InOut[11] = a03 * b20 + a13 * b21 + a23 * b22;

        return f16InOut;
    }
}