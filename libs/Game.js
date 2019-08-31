// モジュール
const World = require( './World.js' );
const OverlapTester = require( './OverlapTester.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// ゲームクラス
// ・ワールドを保持する
// ・通信処理を有する
// ・周期的処理を有する
module.exports = class Game
{
    // 始動
    start( io )
    {
        // 変数
        const world = new World( io ); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
        let iTimeLast = Date.now(); // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。

        // 接続時の処理
        // ・サーバーとクライアントの接続が確立すると、
        // 　サーバーで、'connection'イベント
        // 　クライアントで、'connect'イベントが発生する
        io.on(
            'connection',
            ( socket ) =>
            {
                console.log( 'connection : socket.id = %s', socket.id );
                let tank = null;	// コネクションごとのタンクオブジェクト。イベントをまたいで使用される。

                // まだゲーム開始前。プレイしていない通信のソケットIDリストに追加
                world.setNotPlayingSocketID.add( socket.id );

                // ゲーム開始時の処理の指定
                // ・クライアント側の接続確立時の「socket.emit( 'enter-the-game' );」に対する処理
                socket.on( 'enter-the-game',
                    ( objConfig ) =>
                    {	// 自タンクの作成
                        console.log( 'enter-the-game : socket.id = %s', socket.id );
                        tank = world.createTank( socket.id, objConfig.strNickName );
                    } );

                // 移動コマンドの処理の指定
                // ・クライアント側のキー入力時の「socket.emit( 'change-my-movement', objMovement );」に対する処理
                socket.on( 'change-my-movement',
                    ( objMovement ) =>
                    {
                        //console.log( 'change-my-movement : socket.id = %s', socket.id );
                        if( !tank
                            || 0 === tank.iLife )
                        {
                            return;
                        }
                        tank.objMovement = objMovement;	// 動作
                    } );

                // ショット時の処理の指定
                // ・クライアント側のキー入力時の「socket.emit( 'shoot' );」に対する処理
                socket.on( 'shoot',
                    () =>
                    {
                        //console.log( 'shoot : socket.id = %s', socket.id );
                        if( !tank
                            || 0 === tank.iLife )
                        {
                            return;
                        }
                        world.createBullet( tank );	// ショット
                    } );

                // 切断時の処理の指定
                // ・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
                socket.on( 'disconnect',
                    () =>
                    {
                        console.log( 'disconnect : socket.id = %s', socket.id );
                        if( !tank )
                        {
                            // プレイしていない通信のソケットIDリストから削除
                            world.setNotPlayingSocketID.delete( socket.id );
                            return;
                        }
                        world.destroyTank( tank );
                        tank = null;	// 自タンクの解放
                    } );
            } );

        // 周期的処理（1秒間にFRAMERATE回の場合、delayは、1000[ms]/FRAMERATE[回]）
        setInterval(
            () =>
            {
                // 経過時間の算出
                const iTimeCurrent = Date.now();    // ミリ秒単位で取得
                const fDeltaTime = ( iTimeCurrent - iTimeLast ) * 0.001;	// 秒に変換
                iTimeLast = iTimeCurrent;
                //console.log( 'DeltaTime = %f[s]', fDeltaTime );

                // 処理時間計測用
                const hrtime = process.hrtime();  // ナノ秒単位で取得

                // ゲームワールドの更新
                world.update( fDeltaTime );

                const hrtimeDiff = process.hrtime( hrtime );
                const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];

                // 最新状況をクライアントに送信
                // タンクごとの処理
                world.setTank.forEach(
                    ( tank ) =>
                    {
                        if( '' !== tank.strSocketID )   // ボットは無処理
                        {
                            const rectVisibleArea = {
                                fLeft: tank.fX - SharedSettings.CANVAS_WIDTH * 0.5,
                                fBottom: tank.fY - SharedSettings.CANVAS_HEIGHT * 0.5,
                                fRight: tank.fX + SharedSettings.CANVAS_WIDTH * 0.5,
                                fTop: tank.fY + SharedSettings.CANVAS_HEIGHT * 0.5,
                            };
                            io.to( tank.strSocketID ).emit( 'update',
                                Array.from( world.setTank ).filter(
                                    ( tank ) =>
                                    {
                                        return OverlapTester.overlapRects( rectVisibleArea, tank.rectBound );
                                    } ),
                                Array.from( world.setWall ).filter(
                                    ( wall ) =>
                                    {
                                        return OverlapTester.overlapRects( rectVisibleArea, wall.rectBound );
                                    } ),
                                Array.from( world.setBullet ).filter(
                                    ( bullet ) =>
                                    {
                                        return OverlapTester.overlapRects( rectVisibleArea, bullet.rectBound );
                                    } ),
                                iNanosecDiff );	// 個別送信
                        }
                    } );

                // プレーしていないソケットごとの処理
                const rectVisibleArea = {
                    fLeft: SharedSettings.FIELD_WIDTH * 0.5 - SharedSettings.CANVAS_WIDTH * 0.5,
                    fBottom: SharedSettings.FIELD_HEIGHT * 0.5 - SharedSettings.CANVAS_HEIGHT * 0.5,
                    fRight: SharedSettings.FIELD_WIDTH * 0.5 + SharedSettings.CANVAS_WIDTH * 0.5,
                    fTop: SharedSettings.FIELD_HEIGHT * 0.5 + SharedSettings.CANVAS_HEIGHT * 0.5,
                };
                world.setNotPlayingSocketID.forEach(
                    ( strSocketID ) =>
                    {
                        io.to( strSocketID ).emit( 'update',
                            Array.from( world.setTank ).filter(
                                ( tank ) =>
                                {
                                    return OverlapTester.overlapRects( rectVisibleArea, tank.rectBound );
                                } ),
                            Array.from( world.setWall ).filter(
                                ( wall ) =>
                                {
                                    return OverlapTester.overlapRects( rectVisibleArea, wall.rectBound );
                                } ),
                            Array.from( world.setBullet ).filter(
                                ( bullet ) =>
                                {
                                    return OverlapTester.overlapRects( rectVisibleArea, bullet.rectBound );
                                } ),
                            iNanosecDiff );	// 個別送信
                    } );
            },
            1000 / GameSettings.FRAMERATE );	// 単位は[ms]。1000[ms] / FRAMERATE[回]
    }
}
