class FPSCounter
{
    // コンストラクタ
    constructor()
    {
        this.lStartTime = Date.now();   // ミリ秒単位で取得
        this.iFrames = 0;
    }


    logFrame()
    {
        this.iFrames++;
        if( 1000 <= Date.now() - this.lStartTime )
        {   // １秒を超えたら処理
            console.log( 'FPSCounter : fps = ' + this.iFrames );
            this.iFrames = 0;
            this.lStartTime = Date.now();
        }
    }
}
