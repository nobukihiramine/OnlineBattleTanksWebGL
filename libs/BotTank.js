// モジュール
const Tank = require( './Tank.js' );

// 設定
const GameSettings = require( './GameSettings.js' );

// ボットタンククラス
module.exports = class BotTank extends Tank
{
    constructor( strNickName, fFieldWidth, fFieldHeight, setWall )
    {
        // 親クラスのコンストラクタ呼び出し
        super( '', strNickName, fFieldWidth, fFieldHeight, setWall );

        this.isBot = true;
        this.fSpeed = GameSettings.BOTTANK_SPEED;
        this.objMovement['forward'] = true;	// ひたすら前進。ものに当たったら、方向をランダムで変える。
    }

    // 更新
    // ※rectField : フィールド矩形は、オブジェクト中心と判定する。（OverlapTester.pointInRect()）
    //               オブジェクトの大きさ分狭めた(上下左右で、大きさの半分づつ狭めた）矩形が必要。
    //               呼び出され側で領域を狭めのは、処理コストが無駄なので、呼び出す側で領域を狭めて渡す。
    update( fDeltaTime, rectField, setWall )
    {
        // 親クラスの関数呼び出し
        const bDrived = super.update( fDeltaTime, rectField, setWall );

        if( !bDrived )
        {	// 前進できなかった
            // 方向転換
            this.fAngle = Math.random() * 2 * Math.PI;
        }
    }
}
