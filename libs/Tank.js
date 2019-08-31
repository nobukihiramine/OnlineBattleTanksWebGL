// モジュール
const GameObject = require( './GameObject.js' );
const OverlapTester = require( './OverlapTester.js' );
const Bullet = require( './Bullet.js' );

// 設定
const SharedSettings = require( '../public/js/SharedSettings.js' );
const GameSettings = require( './GameSettings.js' );

// タンククラス
module.exports = class Tank extends GameObject
{
    // コンストラクタ
    constructor( strSocketID, strNickName, rectField, setWall )
    {
        // 親クラスのコンストラクタ呼び出し
        super( SharedSettings.TANK_WIDTH, SharedSettings.TANK_HEIGHT, 0.0, 0.0, Math.random() * 2 * Math.PI );

        this.strSocketID = strSocketID;
        this.strNickName = strNickName;
        this.objMovement = {};  // 動作
        this.fSpeed = GameSettings.TANK_SPEED;    // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
        this.fRotationSpeed = GameSettings.TANK_ROTATION_SPEED;    // 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。
        this.iTimeLastShoot = 0;    // 最終ショット時刻
        this.iLife = GameSettings.TANK_LIFE_MAX;
        this.iLifeMax = GameSettings.TANK_LIFE_MAX;
        this.iScore = 0;

        // 障害物にぶつからない初期位置の算出
        do
        {
            this.setPos( rectField.fLeft + Math.random() * ( rectField.fRight - rectField.fLeft ),
                rectField.fBottom + Math.random() * ( rectField.fTop - rectField.fBottom ) );
        } while( this.overlapWalls( setWall ) );
    }

    toJSON()
    {
        return Object.assign(
            super.toJSON(),
            {
                strSocketID: this.strSocketID,
                strNickName: this.strNickName,
                iLife: this.iLife,
                iLifeMax: this.iLifeMax,
                iScore: this.iScore,
            } );
    }

    // 更新
    // ※rectField : フィールド矩形は、オブジェクト中心と判定する。（OverlapTester.pointInRect()）
    //               オブジェクトの大きさ分狭めた(上下左右で、大きさの半分づつ狭めた）矩形が必要。
    //               呼び出され側で領域を狭めのは、処理コストが無駄なので、呼び出す側で領域を狭めて渡す。
    update( fDeltaTime, rectField, setWall )
    {
        const fX_old = this.fX; // 移動前座標値のバックアップ
        const fY_old = this.fY; // 移動前座標値のバックアップ
        let bDrived = false;    // 前後方向の動きがあったか
        // 動作に従って、タンクの状態を更新
        if( this.objMovement['forward'] )
        {   // 前進
            const fDistance = this.fSpeed * fDeltaTime;
            //console.log( 'forward' );
            this.setPos( this.fX + fDistance * Math.cos( this.fAngle ),
                this.fY + fDistance * Math.sin( this.fAngle ) );
            bDrived = true;
        }
        if( this.objMovement['back'] )
        {   // 後進
            const fDistance = this.fSpeed * fDeltaTime;
            //console.log( 'back' );
            this.setPos( this.fX - fDistance * Math.cos( this.fAngle ),
                this.fY - fDistance * Math.sin( this.fAngle ) );
            bDrived = true;
        }
        if( bDrived )
        {   // 動きがある場合は、不可侵領域との衝突のチェック
            let bCollision = false;
            if( !OverlapTester.pointInRect( rectField, { fX: this.fX, fY: this.fY } ) )
            {   // フィールドの外に出た。
                bCollision = true;
            }
            else if( this.overlapWalls( setWall ) )
            {   // 壁に当たった。
                bCollision = true;
            }
            if( bCollision )
            {   // 衝突する場合は、移動できない。
                this.setPos( fX_old, fY_old );
                bDrived = false;    // 前後方向の動きはなし
            }
        }

        if( this.objMovement['left'] )
        {   // 左転回
            //console.log( 'left' );
            // X軸が右向き、Y軸が「上」向きの世界では、左回転は、角度が増える方向
            // X軸が右向き、Y軸が「下」向きの世界では、左回転は、角度が減る方向
            this.fAngle += this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            //this.fAngle -= this.fRotationSpeed * fDeltaTime;  // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }
        if( this.objMovement['right'] )
        {   // 右転回
            //console.log( 'right' );
            // X軸が右向き、Y軸が「上」向きの世界では、右回転は、角度が減る方向
            // X軸が右向き、Y軸が「下」向きの世界では、右回転は、角度が増える方向
            this.fAngle -= this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            //this.fAngle += this.fRotationSpeed * fDeltaTime;  // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }

        return bDrived; // 前後方向の動きがあったかを返す（ボットタンクで使用する）
    }

    // ショット可能かどうか
    canShoot()
    {
        if( GameSettings.TANK_WAIT_FOR_NEW_BULLET > Date.now() - this.iTimeLastShoot )
        {   // ショット待ち時間内はショット不可
            return false;
        }

        return true;
    }

    // ショット
    shoot()
    {
        if( !this.canShoot() )
        {   // ショット不可の場合は、nullを返す
            return null;
        }

        // 最終ショット時刻を更新
        this.iTimeLastShoot = Date.now();

        // 新しい弾丸の生成（先端から出ているようにするために、幅の半分オフセットした位置に生成する）
        const fX = this.fX + this.fWidth * 0.5 * Math.cos( this.fAngle );
        const fY = this.fY + this.fWidth * 0.5 * Math.sin( this.fAngle );
        return new Bullet( fX, fY, this.fAngle, this );
    }

    // ダメージ
    damage()
    {
        this.iLife--;
        return this.iLife;
    }
}
