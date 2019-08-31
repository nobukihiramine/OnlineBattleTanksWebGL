// モジュール
const GameObject = require( './GameObject.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );

// 壁クラス
module.exports = class Wall extends GameObject
{
    // コンストラクタ
    constructor( fX, fY )
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.WALL_WIDTH, SharedSettings.WALL_HEIGHT, fX, fY, 0 );
    }
}
