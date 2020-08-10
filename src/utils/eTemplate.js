class ETemplate {
    constructor(info) {
        this.email = info.email;
        this.code = info.code;
        this.title = info.title;
    }

    register(){
        return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>${this.title}</title>
    <meta charset="utf-8" />
</head>
<body>
<div class="qmbox qm_con_body_content qqmail_webmail_only">
    <style type="text/css">
        .qmbox body {
            margin: 0;
            padding: 0;
            background: #fff;
            font-family: "Verdana, Arial, Helvetica, sans-serif";
            font-size: 14px;
            line-height: 24px;
        }

        .qmbox div, .qmbox p, .qmbox span, .qmbox img {
            margin: 0;
            padding: 0;
        }

        .qmbox img {
            border: none;
        }

        .qmbox .contaner {
            margin: 0 auto;
        }

        .qmbox .title {
            margin: 0 auto;
            background: #CCC;
            height: 30px;
            text-align: center;
            font-weight: bold;
            padding-top: 12px;
            font-size: 16px;
        }

        .qmbox .content {
            margin: 4px 0;
        }

        .qmbox .biaoti {
            padding: 6px;
            color: #000;
        }

        .qmbox .xboxcontent {
            display: block;
            border: 1px solid #BCBCBC;
        }

        .qmbox .line {
            margin-top: 6px;
            border-top: 1px dashed #B9B9B9;
            padding: 4px;
        }

        .qmbox .neirong {
            padding: 6px;
            color: #666666;
        }

        .qmbox .foot {
            padding: 6px;
            color: #777;
        }

        .qmbox .font_darkblue {
            color: #006699;
            font-weight: bold;
        }

        .qmbox .font_lightblue {
            color: #008BD1;
            font-weight: bold;
        }

        .qmbox .font_gray {
            color: #888;
            font-size: 12px;
        }
    </style>
    <div class="contaner">
        <div class="title">${this.title}</div>
        <div class="content">
            <div class="xboxcontent">
                <div class="neirong">
                    <p><b>请核对你的账户：</b><span class="font_darkblue">${this.email}</span></p>
                    <p><b>验证码：</b><span class="font_lightblue"><span style="border-bottom: 1px dashed rgb(204, 204, 204); z-index: 1; position: static;">${this.code}</span></span><br><span class="font_gray">(验证码10分钟内有效！)</span></p>
                    <div class="line">如果你未申请验证服务，请忽略该邮件。</div>
                </div>
            </div>
            <p class="foot">如果仍有问题，请询问管理人员</p>
        </div>
    </div>
    <style type="text/css">
        .qmbox style, .qmbox script, .qmbox head, .qmbox link, .qmbox meta {
            display: none !important;
        }
    </style>
</div>
</body>
</html>`
    }
}
module.exports = ETemplate;