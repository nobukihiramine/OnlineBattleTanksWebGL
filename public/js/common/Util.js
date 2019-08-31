﻿// 2の階乗かどうか
function isPowerOfTwo( value )
{
    return ( 0 == ( value & ( value - 1 ) ) );
    /*
     * ２進数表現で、
     * 100・・・00の場合のみ真になる。
     * 途中に1があると、偽になる。
     * 例）
     * 100の場合、100 & 011 => 000
     * 110の場合、110 & 101 => 100
     * 111の場合、111 & 110 => 110
     * 100000の場合、100000 & 011111 => 000000
     * 100100の場合、100100 & 100011 => 100000
     */
}
