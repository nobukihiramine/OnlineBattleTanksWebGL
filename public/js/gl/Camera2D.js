class Camera2D
{
    // コンストラクタ
    constructor( fFrustumWidth, fFrustumHeight )
    {
        this.fZoom = 1.0;
        this.fFrustumWidth = fFrustumWidth;
        this.fFrustumHeight = fFrustumHeight;
        this.fCenterX = fFrustumWidth * 0.5;
        this.fCenterY = fFrustumHeight * 0.5;

        this.f16ProjectionMatrix = MatrixUtil.createMatrix();
    }

    getFrustumWidth()
    {
        return this.fFrustumWidth;
    }

    getFrustumHeight()
    {
        return this.fFrustumHeight;
    }

    setCenter( fX, fY )
    {
        this.fCenterX = fX;
        this.fCenterY = fY;
    }

    setViewportAndMatrix( gl,
        iViewportWidth,
        iViewportHeight,
        uniformlocation_ModelViewMatrix,
        uniformlocation_ProjectionMatrix )
    {
        gl.viewport( 0, 0, iViewportWidth, iViewportHeight );

        this.f16ProjectionMatrix = MatrixUtil.createOrthoMatrix(
            this.fCenterX - this.fFrustumWidth / this.fZoom / 2.0,
            this.fCenterX + this.fFrustumWidth / this.fZoom / 2.0,
            this.fCenterY - this.fFrustumHeight / this.fZoom / 2.0,
            this.fCenterY + this.fFrustumHeight / this.fZoom / 2.0,
            1.0, -1.0 );

        // 変換行列の転送
        gl.uniformMatrix4fv( uniformlocation_ProjectionMatrix, // シェーダープログラム中の投影変換行列の場所
            false,  // must be false
            this.f16ProjectionMatrix );  // 投影変換行列の場所

        const f16ModelViewMatrix = MatrixUtil.createMatrix();
        // 変換行列の転送
        gl.uniformMatrix4fv( uniformlocation_ModelViewMatrix, // シェーダープログラム中のモデルビュー変換行列の場所
            false,  // must be false
            f16ModelViewMatrix );   // モデルビュー変換行列
    }
}
