
/*
    @获取token参数获取https://cloud.baidu.com/ 百度智能云创建人工智能应用获取
*/
;(function(){
    let msg = document.getElementsByClassName('msg')[0];
    let api = window.global.api,obj={},stateAPP=0;
    init();
    function init(){
        let hrefs = decodeURI(window.location.href),
            href = hrefs.replace('amp;','');
            hash = href.split('?');
            if(!hash[1]){
                msgFun('人员不存在');
                return;
            }
            let objT = hash[1].split('&');
            if(objT.length){
                objT.map((item,index)=>{
                    let apiObj = item.split('=');
                    obj[apiObj[0]]= apiObj[1];
                })
            }
            console.log(obj)
            $('#name').html(obj.name);
            $('#id').html(obj.id);
    }
    $('.imgShow').click(function(){
        if(!obj.name){
            msgFun('人员不存在')
            return;
        }
        $('.mode').show()
    })
    //本地上传
    $('.selectLoad').click(function(){
        stateAPP=0;;
        $('#imgUpload').attr('accept','image/jpg,image/jpeg');
        $('#imgUpload').removeAttr('capture')
        setTimeout(()=>{
            upload()
        },100)
    })
    //拍照上传
    $('.pzUpload').click(function(){
        $('#imgUpload').attr('accept','image/*');
        $('#imgUpload').attr('capture','camera')
        stateAPP=1;
        setTimeout(()=>{
            upload()
        },100)
    })
    $('.cancel').click(function(){
        $('.mode').hide()
    })
    var Orientation = null; 
    function upload(){
        $('#imgUpload').click();
    }
    $('#imgUpload').on('change',function(el){//防止调用多次
        let file = el.target;
        if(!file.files[0]) return;
        var render = new FileReader();
        render.onload=function(e){
            let res = e.target.result;
            if(stateAPP){
                EXIF.getData(file.files[0], function() {  
                    EXIF.getAllTags(this);
                    Orientation = EXIF.getTag(this, 'Orientation');  
                    compress(res,e.total/(1024*1000))
                })
                return;
            }
            $('.mode').hide();
            if(file.files[0].size>1024*1000){
                $('#imgUpload').value=''
                msgFun('图片不能超过1M');
                return;
            }
            $('.see').hide();
            $('#imgSel').show().attr('src',e.target.result);
            window.base64= e.target.result;
            $('.uploadImg').attr('src',window.base64)
        }
        let img64 = render.readAsDataURL(file.files[0]);
    })
     //上传
     $('.okUpload').click(function(){
        if(!window.base64){
            msgFun('请上传图片')
            return;
         }
         if(obj.id){
            if(hex_md5(obj.id+'')!==obj.idCiphertext){
                console.log(hex_md5(obj.id+''))
                msgFun('人员编号错误');
                return;
            }
         }else{
            msgFun('人员不存在');
            return;
         }
        $('.spinner-box').css({'display':'flex'})
        $.ajax({
            method:'post',
            url:api+'uploadPhoto',
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            data:JSON.stringify({
                ciphertext:obj.idCiphertext,
                id:obj.id,
                photo:window.base64
            }),
            success(data){
                $('.spinner-box').css({'display':'none'})
                if(data.code==200){
                    $('#imgSel').hide().attr('src','')
                    $('.see').show();
                    $('.okSHow').show();
                    $('.imgShow').hide();
                    $('#imgUpload').val('');
                    window.base64='';
                    $('.okUpload').hide();
                    msgFun('上传成功',1)
                }else{
                    msgFun(data.msg)
                }
            },
            error(){
                $('.spinner-box').css({'display':'none'})
                msgFun('系统错误')
            } 
        })
    })
    //提示信息
    var timer=null;
    function msgFun(txt,state){
        clearTimeout(timer);
        var p = document.createElement('p');
            p.innerText=txt;
            if(state){
                p.style.color="#5cb85c"
            }else{
                p.style.color="#f00"
            }
        msg.append(p);
        msg.classList.add('active');
        timer =  setTimeout(() => {
            msg.classList.remove('active');
            msg.innerHTML=''
        }, 2000);
    };
    //最终实现思路：
    // 1、设置压缩后的最大宽度 or 高度；
    // 2、设置压缩比例，根据图片的不同size大小，设置不同的压缩比。

        function compress(res,fileSize) { //res代表上传的图片，fileSize大小图片的大小
            var img = new Image(),
                maxW = 320; //设置最大宽度
                img.src=res;
            img.onload = function () {
                var canvas = document.createElement( 'canvas'),
                    ctx = canvas.getContext( '2d');
                if(img.width > maxW) {
                    img.height *= maxW / img.width;
                    img.width = maxW;
                }
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height);
                let dataUrl=null;
                if(Orientation===6){
                    canvas.width = canvas.width * (img.height / img.width);
                    canvas.height =canvas.width+40;
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate(90 * Math.PI / 180); 
                    ctx.drawImage(img, -(canvas.height / 2), -(canvas.width / 2), canvas.height, canvas.width);
                }
                var compressRate = getCompressRate(0.8,fileSize);
                    dataUrl = canvas.toDataURL( 'image/jpg', compressRate);
                $('.mode').hide();
                $('.see').hide();
                $('#imgSel').show().attr('src',dataUrl);
                window.base64= dataUrl;
                $('.uploadImg').attr('src',window.base64)
            }
        }
        function adjustImgOrientation (canvas,ctx, img, orientation, width, height) {
            switch (orientation) {
                case 3:
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, -width, -height, width, height);
                    break;
                case 6:
                    canvas.width = height;  
                    canvas.height = width;
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img, 0, -width, height, width);
                    break;
                case 8:
                    canvas.width = height;  
                    canvas.height = width;
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(img, -height, 0, height, width);
                    break;
                case 2:
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, width, height);
                    break;
                case 4:
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img, -width, -height, width, height);
                    break;
                case 5:
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img, 0, -width, height, width);
                    break;
                case 7:
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(img, -height, 0, height, width);
                    break;
                default:
                    ctx.drawImage(img, 0, 0, width, height);
            }
        }
        function showSize(base64url) {
                //获取base64图片大小，返回MB数字
            var str = base64url.replace('data:image/jpg;base64,', '');
            var equalIndex = str.indexOf('=');
            if(str.indexOf('=')>0) {
                str=str.substring(0, equalIndex);
            }
            var strLength=str.length;
            console.log(strLength)
            var fileLength=parseInt(strLength-(strLength/8)*2);
            // 由字节转换为MB
            var size = "";
            size = (fileLength/(1024 * 1024)).toFixed(2);
            var sizeStr = size + "";                        //转成字符串
            var index = sizeStr.indexOf(".");                    //获取小数点处的索引
            var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
            if(dou == "00"){                                //判断后两位是否为00，如果是则删除00                
                return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
            }
            return Number(size);
        }
        function getCompressRate(allowMaxSize,fileSize){ //计算压缩比率，size单位为MB
            var compressRate = 1;
            if(fileSize/allowMaxSize > 4){
                compressRate = 0.5;
            } else if(fileSize/allowMaxSize >3){
                compressRate = 0.6;
            } else if(fileSize/allowMaxSize >2){
                compressRate = 0.7;
            } else if(fileSize > allowMaxSize){
                compressRate = 0.8;
            } else{
                compressRate = 0.9;
            }
            return compressRate;
        }
})()