// スクリーンクラス
class Screen
{
    // コンストラクタ
    constructor( socket, canvas_gl, canvas_2d )
    {
        this.fpscounter = new FPSCounter(); // FPS計測用
        
        this.socket = socket;
        this.canvas = canvas_gl;
        this.gl = canvas_gl.getContext( 'webgl' );
        if( !this.gl )
        {
            alert( 'Unable to initialize WebGL. Your browser or machine may not support it.' );
            return;
        }
        this.context = canvas_2d.getContext( '2d' );

        this.iProcessingTimeNanoSec = 0;
        this.aTank = null;
        this.aWall = null;
        this.aBullet = null;
        
        // アセット
        this.assets = new Assets();
        this.assets.load( this.gl );

        // キャンバスの初期化
        this.canvas.width = SharedSettings.CANVAS_WIDTH;
        this.canvas.height = SharedSettings.CANVAS_HEIGHT;
        canvas_2d.width = SharedSettings.CANVAS_WIDTH;
        canvas_2d.height = SharedSettings.CANVAS_HEIGHT;

        // WebGL描画用メンバ
        this.shaderProgram = null;
        this.objShaderProgramInfo = null;
        this.camera2d = new Camera2D( this.canvas.width, this.canvas.height );
        this.batcher = new SpriteBatcher( this.gl, 100 );
        
        // GLに関する初期化
        this.initGL();

        // 描画時に際して、一度だけ実施する必要のある処理（毎回実施する必要のない処理）
        this.initRender();

        // ソケットの初期化
        this.initSocket();

        // 描画中心座標値
        this.fCenterX = SharedSettings.FIELD_WIDTH * 0.5;
        this.fCenterY = SharedSettings.FIELD_HEIGHT * 0.5;
    }
    
    // gl座標値をcontext座標値に変換
    gl2context( fX, fY )
    {   // X値は、そのまま
        // Y値は、gl座標値は、下がゼロで、軸は上向き
        //        context座標値は、gl座標値 FIELD_HEIGHTがゼロで、軸は下向き
        return { fX: fX, fY: SharedSettings.FIELD_HEIGHT - fY };
    }

    // GLに関する初期化
    initGL()
    {
        this.gl.clearColor( 0.5, 0.5, 0.5, 1.0 );  // クリアカラー
        this.gl.clearDepth( 1.0 );                 // クリア深度
        this.gl.disable( this.gl.DEPTH_TEST );      // デプステスト無効（後に描いたもので上描いていく）
        
        this.gl.enable( this.gl.BLEND );    // ブレンディング有効
        this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );        
    }

    setupShaderProgram()
    {
        // バーテックスシェーダー
        const strSourceVertexShader =
            `   attribute vec4 attributePosition;
                attribute vec2 attributeTexCoord;
                uniform mat4 uniformModelViewMatrix;
                uniform mat4 uniformProjectionMatrix;
                varying highp vec2 varyingTexCoord;
                void main()
                {
                    gl_Position = uniformProjectionMatrix * uniformModelViewMatrix * attributePosition;
                    varyingTexCoord = attributeTexCoord;
                }`;

        // フラグメントシェーダー
        const strSourceFragmentShader =
            `   varying highp vec2 varyingTexCoord;
                uniform sampler2D uniformTexture;
                void main()
                {
                    gl_FragColor = texture2D(uniformTexture, varyingTexCoord);
                }`;

        this.shaderProgram = this.gl.createProgram();    // シェーダープログラムを作成

        // 属性位置のバインド
        this.gl.bindAttribLocation( this.shaderProgram, Constants.ATTRIBLOCATION_POSITION, 'attributePosition' );
        this.gl.bindAttribLocation( this.shaderProgram, Constants.ATTRIBLOCATION_TEXCOORD, 'attributeTexCoord' );

        // シェーダープログラムの作成
        if( !setupShaderProgram( this.gl, this.shaderProgram, strSourceVertexShader, strSourceFragmentShader ) )
        {
            console.log( 'Failed : setupShaderProgram()' );
        }

        // シェーダープログラム中の変数の位置
        this.objShaderProgramInfo = {
            uniformlocation_ModelViewMatrix: this.gl.getUniformLocation( this.shaderProgram, 'uniformModelViewMatrix' ),
            uniformlocation_ProjectionMatrix: this.gl.getUniformLocation( this.shaderProgram, 'uniformProjectionMatrix' ),
            uniformlocation_Texture: this.gl.getUniformLocation( this.shaderProgram, 'uniformTexture' ),
        }
    }

    // 描画時に際して、一度だけ実施する必要のある処理（毎回実施する必要のない処理）
    initRender()
    {
        // シェーダープログラムの構築
        this.setupShaderProgram();

        // 構築したシェーダープログラムを使用するプログラムとして設定
        this.gl.useProgram( this.shaderProgram );

         // アクティブテクスチャの選択（省略可。デフォルトでテクスチャユニット０がカレントになっている）
        this.gl.activeTexture( this.gl.TEXTURE0 );

        // 投影変換についての処理
        /*this.camera2d.setViewportAndMatrix( this.gl,
            this.canvas.width, this.canvas.height,
            this.objShaderProgramInfo.uniformlocation_ModelViewMatrix,
            this.objShaderProgramInfo.uniformlocation_ProjectionMatrix );*/
    }

    // ソケットの初期化
    initSocket()
    {
        // 接続確立時の処理
        // ・サーバーとクライアントの接続が確立すると、
        // 　サーバーで、'connection'イベント
        // 　クライアントで、'connect'イベントが発生する
        this.socket.on(
            'connect',
            () => 
            {
                console.log( 'connect : socket.id = %s', socket.id );
                // サーバーに'enter-the-game'を送信
                // this.socket.emit( 'enter-the-game' );
            } );

        // サーバーからの状態通知に対する処理
        // ・サーバー側の周期的処理の「io.sockets.emit( 'update', ・・・ );」に対する処理
        this.socket.on(
            'update',
            ( aTank, aWall, aBullet, iProcessingTimeNanoSec ) =>
            {
                this.aTank = aTank;
                this.aWall = aWall;
                this.aBullet = aBullet;
                this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
            } );

        // デッドしたらスタート画面に戻る
        this.socket.on(
            'dead',
            () =>
            {
                $( '#start-screen' ).show();
            } );
    }

    // アニメーション（無限ループ処理）
    animate( iTimeCurrent )
    {
        requestAnimationFrame(
            ( iTimeCurrent ) =>
            {
                this.animate( iTimeCurrent );
            } );
        this.render( iTimeCurrent );
    }

    // 描画。animateから無限に呼び出される
    render( iTimeCurrent )
    {
        //console.log( 'render' );

        // 自タンクの取得
        let tankSelf = null;
        if( null !== this.aTank )
        {
            this.aTank.some(
                ( tank ) =>
                {
                    if( tank.strSocketID === this.socket.id )
                    {   // 自タンク
                        tankSelf = tank;
                        return true;
                    }
                } );
        }

        // 描画中心座標値
        if( null !== tankSelf )
        {   // 自タンク座標値
            this.fCenterX = tankSelf.fX;
            this.fCenterY = tankSelf.fY;
        }
        else
        {
            this.fCenterX = SharedSettings.FIELD_WIDTH * 0.5;
            this.fCenterY = SharedSettings.FIELD_HEIGHT * 0.5;
        }

        // テクスチャ領域の構築（テクスチャファイルの読み込みがいつ完了するかわからなないので、なんども呼び出す必要がある）
        this.assets.setupTextureRegion();

        // キャンバスのクリア
        this.gl.clear( this.gl.COLOR_BUFFER_BIT );
        this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

        // 全体を平行移動
        // 常にプレーヤーを中心に描画する（結果としてプレーヤーの周りがスクロール描画となる）
        this.camera2d.setCenter( this.fCenterX, this.fCenterY );
        // 投影変換についての処理
        this.camera2d.setViewportAndMatrix( this.gl,
            this.canvas.width, this.canvas.height,
            this.objShaderProgramInfo.uniformlocation_ModelViewMatrix,
            this.objShaderProgramInfo.uniformlocation_ProjectionMatrix );
        // 中心座標値が(CenterX, CenterY)、キャンバスの大きさが(CanvasX, CanvaxY)の場合
        // キャンバス中心は(CanvasX/2, CanvasY/2)
        // 中心座標値とキャンバス中心との差分、オフセットする。
        // オフセット量は、{ -(CenterX - CanvasX/2), -(CenterY - CanvasY/2) } => { CanvasX * 0.5 - CenterX, CanvasY * 0.5 - CanvasY}
        this.context.save();
        const point_context = this.gl2context( this.fCenterX, this.fCenterY ); // gl座標値をcontext座標値に変換
        this.context.translate( this.canvas.width * 0.5 - point_context.fX, this.canvas.height * 0.5 - point_context.fY );

        // キャンバスの塗りつぶし
        this.renderField();

        // アイテムの描画
        {
            this.batcher.beginBatch();

            // タンクの描画
            this.renderTanks( iTimeCurrent );
            
            // 壁の描画
            this.renderWalls();
            
            // 弾丸の描画
            this.renderBullets();
            
            this.batcher.endBatch( this.gl,
                this.assets.textureinfoItems,
                this.objShaderProgramInfo.uniformlocation_Texture );

        }

        // 全体を平行移動の終了
        this.context.restore();

        // キャンバスの枠の描画
        this.context.save();
        this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        this.context.strokeRect( 0, 0, this.canvas.width, this.canvas.height );
        this.context.restore();

        // 画面左上に得点表示
        if( null !== tankSelf )
        {
            this.context.save();
            this.context.font = RenderingSettings.SCORE_FONT;
            this.context.fillStyle = RenderingSettings.SCORE_COLOR;
            this.context.fillText( 'Score : ' + tankSelf.iScore,
                20,
                40 );
            this.context.restore();
        }

        // 画面右上にサーバー処理時間表示
        this.context.save();
        this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
        this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
        this.context.fillText( ( this.iProcessingTimeNanoSec * 1e-9 ).toFixed( 9 ) + ' [s]',
            this.canvas.width - 30 * 10,
            40 );
        this.context.restore();

        this.fpscounter.logFrame();
    }

    renderField()
    {
        let fVisibleAreaLeft = this.fCenterX - this.canvas.width * 0.5;
        let fVisibleAreaTop = this.fCenterY - this.canvas.height * 0.5;
        let fVisibleAreaRight = this.fCenterX + this.canvas.width * 0.5;
        let fVisibleAreaBottom = this.fCenterY + this.canvas.height * 0.5;
        if( 0 > fVisibleAreaLeft ) { fVisibleAreaLeft = 0.0; }  // ミニマックス補正
        if( 0 > fVisibleAreaTop ) { fVisibleAreaTop = 0.0; }    // ミニマックス補正
        if( SharedSettings.FIELD_WIDTH - 1 < fVisibleAreaRight ) { fVisibleAreaRight = SharedSettings.FIELD_WIDTH - 1; }    // ミニマックス補正
        if( SharedSettings.FIELD_HEIGHT - 1 < fVisibleAreaBottom ) { fVisibleAreaBottom = SharedSettings.FIELD_HEIGHT - 1; }    // ミニマックス補正
        const iBackTileIndexLeft = parseInt( fVisibleAreaLeft / RenderingSettings.FIELDTILE_WIDTH );
        const iBackTileIndexTop = parseInt( fVisibleAreaTop / RenderingSettings.FIELDTILE_HEIGHT );
        const iBackTileIndexRight = parseInt( fVisibleAreaRight / RenderingSettings.FIELDTILE_WIDTH );
        const iBackTileIndexBottom = parseInt( fVisibleAreaBottom / RenderingSettings.FIELDTILE_HEIGHT );

        this.batcher.beginBatch();

        for( let iIndexY = iBackTileIndexTop; iIndexY <= iBackTileIndexBottom; iIndexY++ )
        {
            for( let iIndexX = iBackTileIndexLeft; iIndexX <= iBackTileIndexRight; iIndexX++ )
            {
                // 画像描画
                this.batcher.drawSprite0(
                    iIndexX * RenderingSettings.FIELDTILE_WIDTH,  // 描画先領域の左下座標
                    iIndexY * RenderingSettings.FIELDTILE_HEIGHT, // 描画先領域の左下座標
                    iIndexX * RenderingSettings.FIELDTILE_WIDTH + RenderingSettings.FIELDTILE_WIDTH,    // 描画先領域の右上座標
                    iIndexY * RenderingSettings.FIELDTILE_HEIGHT + RenderingSettings.FIELDTILE_HEIGHT,   // 描画先領域の右上座標
                    this.assets.rectFieldInFieldTexture );
            }
        }

        this.batcher.endBatch( this.gl,
            this.assets.textureinfoField,
            this.objShaderProgramInfo.uniformlocation_Texture );
    }

    renderTanks( iTimeCurrent )
    {
        if( null == this.aTank )
        {
            return;
        }
        
        const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
        const iIndexFrame = parseInt( fTimeCurrentSec / 0.2 ) % 2;  // フレーム番号

        // 連続画像内の対象画像の領域の取得（todo:animationTank対応）
        const rectFrameTextureRegion = this.assets.animationTank.getFrameTextureRegion( fTimeCurrentSec,
            Animation.ANIMATION_LOOPING );

        this.aTank.forEach(
            ( tank ) =>
            {
                // 画像描画
                this.batcher.drawSprite2( tank.fX,      // 描画先領域の中心座標
                         tank.fY,      // 描画先領域の中心座標
                         SharedSettings.TANK_WIDTH,  // 描画先領域のサイズ
                         SharedSettings.TANK_HEIGHT, // 描画先領域のサイズ
                         tank.fAngle,  // 描画先領域の回転角度
                         rectFrameTextureRegion );

                // ライフ
                const fLifeCellWidth = SharedSettings.TANK_WIDTH / tank.iLifeMax;
                const fLifeRemainingWidth = fLifeCellWidth * tank.iLife;
                const fLifeMaxCellWidth   = fLifeCellWidth * tank.iLifeMax;
                const fLifeCellStartX = -( fLifeCellWidth * tank.iLifeMax * 0.5 );
                const fLifeCellStartY = - (SharedSettings.TANK_HEIGHT * 0.5);
                // ゼロからライフ値まで：REMAINING_COLOR
                // if( 0 < tank.iLife )
                {
                    this.batcher.drawSprite0(
                        tank.fX + fLifeCellStartX,  // 描画先領域の左下座標
                        tank.fY + fLifeCellStartY, // 描画先領域の左下座標
                        tank.fX + fLifeCellStartX + fLifeRemainingWidth,    // 描画先領域の右上座標
                        tank.fY + fLifeCellStartY - 10,   // 描画先領域の右上座標
                        this.assets.rectLifeRemainingTexture );
                }
                // ライフ値からライフマックスまで：MISSING_COLOR
                if( tank.iLife < tank.iLifeMax )
                {
                    this.batcher.drawSprite0(
                        tank.fX + fLifeCellStartX + fLifeRemainingWidth,  // 描画先領域の左下座標
                        tank.fY + fLifeCellStartY, // 描画先領域の左下座標
                        tank.fX + fLifeCellStartX + fLifeMaxCellWidth,    // 描画先領域の右上座標
                        tank.fY + fLifeCellStartY - 10,   // 描画先領域の右上座標
                        this.assets.rectLifeMissingTexture );
                }
                
                // ニックネーム
                this.context.save();
                this.context.textAlign = 'center';
                this.context.font = RenderingSettings.NICKNAME_FONT;
                this.context.fillStyle = RenderingSettings.NICKNAME_COLOR;
                const point_context = this.gl2context( tank.fX, tank.fY );   // gl座標値をcontext座標値に変換
                this.context.fillText( tank.strNickName, point_context.fX, point_context.fY - 50 );
                this.context.restore();
            } );
    }

    renderWalls()
    {
        if( null == this.aWall )
        {
            return;
        }

        this.aWall.forEach(
            ( wall ) =>
            {
                // 画像描画
                this.batcher.drawSprite1( wall.fX,      // 描画先領域の中心座標
                         wall.fY,      // 描画先領域の中心座標
                         SharedSettings.WALL_WIDTH,  // 描画先領域のサイズ
                         SharedSettings.WALL_HEIGHT, // 描画先領域のサイズ
                         this.assets.rectWallInItemsTexture );
            } );
    }
    
    renderBullets()
    {
        if( null == this.aBullet )
        {
            return;
        }

        this.aBullet.forEach(
            ( bullet ) =>
            {
                // 画像描画
                this.batcher.drawSprite2( bullet.fX,      // 描画先領域の中心座標
                         bullet.fY,      // 描画先領域の中心座標
                         SharedSettings.BULLET_WIDTH,  // 描画先領域のサイズ
                         SharedSettings.BULLET_WIDTH, // 描画先領域のサイズ
                         bullet.fAngle,  // 描画先領域の回転角度
                         this.assets.rectBulletInItemsTexture );
            } );
    }
}
