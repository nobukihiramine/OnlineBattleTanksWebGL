// アセット群クラス
class Assets
{
    // コンストラクタ
    constructor()
    {
        // 背景画像
        this.textureinfoField = null;
        this.bSetupedFieldTextureRegion = false;
        this.rectFieldInFieldTexture = new Rect( 0.0, 1.0, 1.0, 0.0 );    // 画像が読み込まれるまで使用する暫定値

        // アイテム
        this.textureinfoItems = null;
        this.bSetupedItemsTextureRegion = false;
        this.animationTank = new Animation( 0.2, [new Rect( 0.0, 1.0, 1.0, 0.0 )] );    // 画像が読み込まれるまで使用する暫定値
        this.rectWallInItemsTexture = new Rect( 0.0, 1.0, 1.0, 0.0 );    // 画像が読み込まれるまで使用する暫定値
        this.rectBulletInItemsTexture = new Rect( 0.0, 1.0, 1.0, 0.0 );    // 画像が読み込まれるまで使用する暫定値
        this.rectLifeRemainingTexture = new Rect( 0.0, 1.0, 1.0, 0.0 );    // 画像が読み込まれるまで使用する暫定値
        this.rectLifeMissingTexture = new Rect( 0.0, 1.0, 1.0, 0.0 );    // 画像が読み込まれるまで使用する暫定値
    }
    
    // テクスチャの読み込み
    load( gl )
    {
        this.textureinfoField = new TextureInfo( gl, '../images/grass01.png' );
        this.textureinfoItems = new TextureInfo( gl, '../images/items.png' );
    }
    
    // テクスチャ領域の構築
    // ・アニメーション処理内で、毎回本関数を呼び出す。
    // ・テクスチャファイルの読み込みが完了するまでは、textureinfoXXXのiWidth, iHeightは、1であり、
    // 　createTextureRegion()は、欲しいテクスチャ領域を返さない。
    // ・テクスチャファイルの読み込みが完了後は、textureinfoXXXのiWidth, iHeightは、1より大きい値になり、
    //  createTextureRegion()は、欲しいテクスチャ領域をを返す。
    setupTextureRegion()
    {
        // 背景画像
        if( false == this.bSetupedFieldTextureRegion   // テクスチャ領域の構築が完了していない（２重処理防止）
            && 1.0 < this.textureinfoField.iWidth )    // かつ、テクスチャファイルの読み込みが完了している場合
        {
            // フィールド
            this.rectFieldInFieldTexture = this.textureinfoField.createTextureRegion( 0, 0, 512, 512 );
            // テクスチャ領域の構築完了。
            this.bSetupedFieldTextureRegion = true;
        }

        if( false == this.bSetupedItemsTextureRegion   // テクスチャ領域の構築が完了していない（２重処理防止）
            && 1.0 < this.textureinfoItems.iWidth )    // かつ、テクスチャファイルの読み込みが完了している場合
        {
            // タンク
            this.animationTank = new Animation( 0.2,
                [this.textureinfoItems.createTextureRegion( 2, 2, 16, 16 ),
                this.textureinfoItems.createTextureRegion( 20, 2, 16, 16 )] );
            // 壁
            this.rectWallInItemsTexture = this.textureinfoItems.createTextureRegion( 38, 2, 64, 16 );
            // 弾丸
            this.rectBulletInItemsTexture = this.textureinfoItems.createTextureRegion( 104, 2, 8, 8 );
            // ライフ残
            this.rectLifeRemainingTexture = this.textureinfoItems.createTextureRegion( 2, 20, 8, 8 );
            // ライフ減
            this.rectLifeMissingTexture = this.textureinfoItems.createTextureRegion( 12, 20, 8, 8 );
            // テクスチャ領域の構築完了。
            this.bSetupedItemsTextureRegion = true;
        }
    }
}
