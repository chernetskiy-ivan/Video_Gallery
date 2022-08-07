# Video Galley. Test Project

## Database Schema

![ds schema!](https://sun9-66.userapi.com/impg/5RHx8C6dExidEMwMOiQVwcXBkucz5SCn3Q0OyA/mF6YEDJEqL4.jpg?size=1049x489&quality=96&sign=25533148a562690fdf3a98718b13339a&type=album)

RT - refresh token

PVR - private video relation

## Video Gallery API

/api

    /auth
        /register
        /login
        /refresh

    /video
        /
        /upload
        /:videoId
        /:videoId/download

**Swagger UI**
![swagger ui](https://sun9-40.userapi.com/impg/rXhIIMWZqYyL9UY8emm11yNZXh195_o3neFp6A/PgT0JRwoPQA.jpg?size=1899x953&quality=96&sign=228da672c5474b50325af7ea7197fafd&type=album)

## Auth

**/register**

Here we can register new user with valide email and password. We store the password encrypted in the database like this

![Example of user model in db](https://sun9-27.userapi.com/impg/R0aTp1WoJQQQLFqP_z-460pz-h37YGKRWVZ_3Q/SUEr64zua2U.jpg?size=790x194&quality=96&sign=4b65188c19ff72a8eba5e7205eded66b&type=album)

**/login**

After the user enters a valid email address and password, they will receive a pair of access and update tokens.

![login endpoint response](https://sun9-20.userapi.com/impg/8jTAp_g2jFGieUS8QkGI3R-9WittoaYMFg5W5g/vQUA6AhDRhs.jpg?size=1745x199&quality=96&sign=30614ec5d0861030a60e16a6eeb11b99&type=album)

We also store the update token in the database, and if the user enters it again, we simply delete the old update token and save the new one.

![refresh token table in db](https://sun9-27.userapi.com/impg/CQnghfuuGKK1k08uhsFMivEWIr_OTjWNvuM_Cg/zONmh-18F2Q.jpg?size=1402x165&quality=96&sign=cccaadcd1824e0338c84ab7bbc086bd6&type=album)

**/refresh**

At the endpoint, we accept an refresh token from the user, then if we store the same token in the db, we create a new access and refresh token and update the old refresh token for the new one.

![refresh endpoint response](https://sun9-20.userapi.com/impg/GHFFk2bv15SpdyvVoNNvl9W-rjv283w2hdszNQ/g546rmMjeuo.jpg?size=1758x514&quality=96&sign=98515691fdc63bbba60fcfd5780bf2c7&type=album)

## Video

**/**

At this endpoint we get the video. First we get videos open to everyone, our own private video and a private video open to us.

**/upload**

Upload a video file with the mp4 extension. And other information to detect an open or private video. The Mode property can have the value true or false. True - open the video, false - the user specifies the user's email address to open the video for someone.

**/:videoId**

This endpoint for get, post, delete methods

**/:videoId/download**

Download video by videoId if you can(private video). Swagger example:

![try to download video file](https://sun9-80.userapi.com/impg/hfNcsBhboEyuP2ixHK61KxNE70NhOx8O_Lvl5g/JsDTL4iphxg.jpg?size=1409x514&quality=96&sign=dc67f32c87b0446679cd0e12fa4d0c62&type=album)

After click _Download file_

![downloaded file](https://sun9-25.userapi.com/impg/0ALkOhbFEuL-TvkozNf5D0ZL9aY0DSJbD-LYPw/DXBzEGfWYf8.jpg?size=1921x57&quality=96&sign=51ea1640f426fc04800a0caf8e663e4f&type=album)

**Add in dev branch**
