class Animation
{
    static get ANIMATION_LOOPING() { return 0; }
    static get ANIMATION_NONLOOPING() { return 1; }

    // コンストラクタ
    constructor( fFrameDuration,
        arectFrameTextureRegion )
    {
        this.fFrameDuration = fFrameDuration;
        this.arectFrameTextureRegion = arectFrameTextureRegion;
    }

    getFrameTextureRegion( fStateTime, iMode )
    {
        let iFrameNumber = parseInt( fStateTime / this.fFrameDuration );

        if( iFrameNumber >= this.arectFrameTextureRegion.length )
        {
            if( this.ANIMATION_NONLOOPING == iMode )
            {
                iFrameNumber = this.arectFrameTextureRegion.length - 1;
            }
            else
            {
                iFrameNumber = iFrameNumber % this.arectFrameTextureRegion.length;
            }
        }

        return this.arectFrameTextureRegion[iFrameNumber];
    }
}
