// モジュール
const GameObject = require( './GameObject.js' );
const OverlapTester = require( './OverlapTester.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// 弾丸クラス
module.exports = class Bullet extends GameObject
{
    constructor( fX, fY, fAngle, tank )
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.BULLET_WIDTH, SharedSettings.BULLET_HEIGHT, fX, fY, fAngle );

        this.fSpeed = GameSettings.BULLET_SPEED;
        this.tank = tank;	// どのタンクから発射されたか
        this.fLifeTime = GameSettings.BULLET_LIFETIME_MAX;
    }

    // 更新
    // ※rectField : フィールド矩形は、オブジェクト中心と判定する。（OverlapTester.pointInRect()）
    //               オブジェクトの大きさ分狭めた(上下左右で、大きさの半分づつ狭めた）矩形が必要。
    //               呼び出され側で領域を狭めのは、処理コストが無駄なので、呼び出す側で領域を狭めて渡す。
    update( fDeltaTime, rectField, setWall )
    {
        this.fLifeTime -= fDeltaTime;
        if( 0 > this.fLifeTime )
        {   // 寿命が尽きた
            return true;    // 消失かどうか。trueを返す。
        }

        // 前進
        const fDistance = this.fSpeed * fDeltaTime;
        this.setPos( this.fX + fDistance * Math.cos( this.fAngle ),
            this.fY + fDistance * Math.sin( this.fAngle ) );

        // 不可侵領域との衝突のチェック
        let bCollision = false;
        if( !OverlapTester.pointInRect( rectField, { fX: this.fX, fY: this.fY } ) )
        {	// フィールドの外に出た。
            bCollision = true;
        }
        else if( this.overlapWalls( setWall ) )
        {	// 壁に当たった。
            bCollision = true;
        }

        return bCollision;    // 消失かどうか。不可侵領域に当たったかを返す。
    }
};
