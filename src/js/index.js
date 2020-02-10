
/*
    @获取token参数获取https://cloud.baidu.com/ 百度智能云创建人工智能应用获取
*/
(function(){
    let msg = document.getElementsByClassName('msg')[0],
        api = window.global.api,obj={};
    init();
    function init(){
        let href = decodeURI(window.location.href),
            hash = href.split('?');
            if(!hash[0]){
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
        upload()
    })
    function upload(){
        $('#imgUpload').click();
        $('#imgUpload').change(function(el){
            let file = el.target;
            var render = new FileReader();
           
            render.onload=function(e){
                console.log(e)
                $('.see').hide();
                $('#imgSel').show().attr('src',e.target.result);
                window.base64= e.target.result;
            }
            window.files = file.files[0];
            let img64 = render.readAsDataURL(file.files[0]);
        })
    }
     //上传
     $('.okUpload').click(function(){
        if(!window.base64){
            msgFun('请上传图片')
            return;
         }
         if(obj.id){
            if(hex_md5(obj.id+'')!==obj.ciphertext){
                msgFun('人员编号错误');
                return;
            }
         }else{
            msgFun('人员不存在');
            return;
         }
         if(window.files.size>1024*1024){
            msgFun('图片必须小于1M');
            return;
        }
        $.ajax({
            method:'post',
            url:api+'UploadPhoto',
            Header:{
                "Content-Type":"application/x-www-form-urlencoded"
            },
            data:{
                ciphertext:obj.ciphertext,
                id:obj.id,
                photo:window.base64
            },
            success(data){
                if(data.state==200){
                    $('#imgSel').hide().attr('src','')
                    $('.see').show();
                    msgFun('上传成功',1)
                }else{
                    msgFun(data.msg)
                }
            },
            error(){
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
    }
})()