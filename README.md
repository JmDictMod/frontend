Front end is based on react js
the backedn is based on express js node js

ask chatgpt if you need help

these are the api calls you can make
also you can put # tag to filter with tag like #ichi
and also search by frq+digit like #frq840
the higher the more freq word,
references for the fields in the modified dictionary
term = t
reading = r
meanings = m
furigana = f
frequency = o
group = g
tags = l
jishoid = j
ruby = b
rt = a
hosted on free vercel https://jmdictmod.vercel.app/
https://apijmdictmod.vercel.app/api/search?query=%E3%81%82%E3%81%8B%E3%82%93&mode=exact

http://localhost:5000/api/search?query=明白%20%23ichi&mode=exact

http://localhost:5000/api/search?query=赤&mode=exact

http://localhost:5000/api/search?query=赤,あか&mode=both

http://localhost:5000/api/search?query=赤&mode=any

and for the english too

http://localhost:5000/api/search?query=hello&mode=en_exact

http://localhost:5000/api/search?query=hello&mode=en_any
