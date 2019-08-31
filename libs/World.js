// モジュール
const Tank = require( './Tank.js' );
const Wall = require( './Wall.js' );
const OverlapTester = require( './OverlapTester.js' );
const BotTank = require( './BotTank.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// ワールドクラス
// ・ゲーム内の各種要素を保持する
// ・ゲームに保持される
// ・ゲームワールドの更新処理を有する（ゲームから要請を受け、保持する各種要素を更新する）
// ・ゲーム内の各種要素の生成、破棄を有する
module.exports = class World
{
    // コンストラクタ
    constructor( io )
    {
        this.io = io;   // socketIO
        this.setTank = new Set();	// タンクリスト
        this.setWall = new Set();	// 壁リスト
        this.setBullet = new Set();	// 弾丸リスト
        this.setNotPlayingSocketID = new Set();    // プレイしていない通信のソケットIDリスト

        // 壁の生成
        for( let i = 0; i < GameSettings.WALL_COUNT; i++ )
        {
            // ランダム座標値の作成
            const fX_left = Math.random() * ( SharedSettings.FIELD_WIDTH - SharedSettings.WALL_WIDTH );
            const fY_bottom = Math.random() * ( SharedSettings.FIELD_HEIGHT - SharedSettings.WALL_HEIGHT );
            // 壁生成
            const wall = new Wall( fX_left + SharedSettings.WALL_WIDTH * 0.5,
                fY_bottom + SharedSettings.WALL_HEIGHT * 0.5 );
            // 壁リストへの登録
            this.setWall.add( wall );
        }

        // ボットの生成
        for( let i = 0; i < GameSettings.BOTTANK_COUNT; i++ )
        {
            this.createBotTank( 'Bot' + ( i + 1 ) );
        }
    }

    // 更新処理
    update( fDeltaTime )
    {
        // オブジェクトの座標値の更新
        this.updateObjects( fDeltaTime );

        // 衝突チェック
        this.checkCollisions();

        // 新たな行動（特に、ボットに関する生成や動作
        this.doNewActions( fDeltaTime );
    }

    // オブジェクトの座標値の更新
    updateObjects( fDeltaTime )
    {
        // タンクの可動域
        const rectTankField = {
            fLeft: 0 + SharedSettings.TANK_WIDTH * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH * 0.5,
            fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };

        // タンクごとの処理
        this.setTank.forEach(
            ( tank ) =>
            {
                tank.update( fDeltaTime, rectTankField, this.setWall );
            } );

        // 弾丸の可動域
        const rectBulletField = {
            fLeft: 0 + SharedSettings.BULLET_WIDTH * 0.5,
            fBottom: 0 + SharedSettings.BULLET_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH - SharedSettings.BULLET_WIDTH * 0.5,
            fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.BULLET_HEIGHT * 0.5
        };

        // 弾丸ごとの処理
        this.setBullet.forEach(
            ( bullet ) =>
            {
                const bDisappear = bullet.update( fDeltaTime, rectBulletField, this.setWall );
                if( bDisappear )
                {	// 消失
                    this.destroyBullet( bullet );
                }
            } );
    }

    // 衝突のチェック
    checkCollisions()
    {
        // 弾丸ごとの処理
        this.setBullet.forEach(
            ( bullet ) =>
            {
                // タンクごとの処理
                this.setTank.forEach(
                    ( tank ) =>
                    {
                        if( tank !== bullet.tank )
                        {	// 発射元のタンクとの衝突処理はなし
                            if( OverlapTester.overlapRects( tank.rectBound, bullet.rectBound ) )
                            {	// 衝突
                                if( 0 === tank.damage() )
                                {	// ライフ無くなった
                                    // タンクの削除
                                    console.log( 'dead : socket.id = %s', tank.strSocketID );
                                    this.destroyTank( tank );
                                }
                                this.destroyBullet( bullet );
                                bullet.tank.iScore++;	// 当てたタンクの得点を加算する
                            }
                        }
                    } );
            } );
    }

    // 新たな行動
    doNewActions( fDeltaTime )
    {
        // ボットは、新たな弾丸を打つかも
        this.setTank.forEach(
            ( tank ) =>
            {
                if( tank.isBot )
                {
                    if( GameSettings.BOTTANK_SHOOT_PROBABILITY_PER_SEC * fDeltaTime > Math.random() )
                    {	// 1秒でN発の発射確率で発射する。（N = GameSettings.BOTTANK_SHOOT_PROBABILITY_PER_SEC）
                        this.createBullet( tank );
                    }
                }
            } );
    }

    // タンクの生成
    createTank( strSocketID, strNickName )
    {
        // ゲーム開始。プレイしていない通信のソケットIDリストから削除
        this.setNotPlayingSocketID.delete( strSocketID );

        // タンクの可動域
        const rectTankField = {
            fLeft: 0 + SharedSettings.TANK_WIDTH * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH * 0.5,
            fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };

        // タンクの生成
        const tank = new Tank( strSocketID, strNickName, rectTankField, this.setWall );

        // タンクリストへの登録
        this.setTank.add( tank );

        return tank;
    }

    // ボットタンクの生成
    createBotTank( strNickName )
    {
        // タンクの可動域
        const rectTankField = {
            fLeft: 0 + SharedSettings.TANK_WIDTH * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH * 0.5,
            fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };

        // ボットタンクの生成
        const tank = new BotTank( strNickName, rectTankField, this.setWall );

        // タンクリストへの登録
        this.setTank.add( tank );
    }

    // タンクの破棄
    destroyTank( tank )
    {
        // タンクリストリストからの削除
        this.setTank.delete( tank );

        if( tank.isBot )
        {	// ボット
            // タイマーを設置し、新たなボットを生成する。
            setTimeout(
                () =>
                {
                    this.createBotTank( tank.strNickName );
                },
                GameSettings.BOTTANK_WAIT_FOR_NEW_BOT );	// 3秒後に、新たなボット生成。
        }
        else
        {
            // ゲーム開始前に戻るので、プレイしていない通信のソケットIDリストに追加
            this.setNotPlayingSocketID.add( tank.strSocketID );
            // 削除タンクのクライアントにイベント'dead'を送信
            this.io.to( tank.strSocketID ).emit( 'dead' );
        }
    }

    // 弾丸の生成
    createBullet( tank )
    {
        const bullet = tank.shoot();
        if( bullet )
        {
            this.setBullet.add( bullet );
        }
    }

    // 弾丸の破棄
    destroyBullet( bullet )
    {
        // 弾丸リストからの削除
        this.setBullet.delete( bullet );
    }
}
