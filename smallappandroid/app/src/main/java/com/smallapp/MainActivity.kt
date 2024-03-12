package com.smallapp

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity


class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    @SuppressLint("JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webview)
        val webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                // 当页面加载完成后，在主线程中执行JavaScript代码
                view.post {
                    // 使用WebView的evaluateJavascript方法执行JavaScript代码
                    view.evaluateJavascript("javascript:window.isAndroid = true;", null);
                    view.evaluateJavascript(getCode("master.js"), null)
                }
            }
        }
        webView.webViewClient = webViewClient
        // 启用JavaScript支持
        webView.settings.javaScriptEnabled = true
        WebView.setWebContentsDebuggingEnabled(true);
        webView.addJavascriptInterface(JSViewBridgeImpl(webView), "AndroidJSViewBridge")
        webView.addJavascriptInterface(JSServiceBridgeImpl(webView), "AndroidJSServiceBridge");
        webView.loadUrl("file:///android_asset/index.html")
    }

    // 重写回退按钮的事件，当用户点击回退按钮时，如果WebView可以回退，则回退到上一个页面
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }


    fun getCode(name: String): String {
        val inputStream = resources.assets.open(name);
        val size = inputStream.available()
        val buffer = ByteArray(size)
        inputStream.read(buffer)
        inputStream.close()
        return String(buffer);
    }

    // 创建一个Java接口，该接口将在WebView的JavaScript代码中暴露
    interface JSViewBridge {
        fun postMessage(param: String)
    }

    class JSViewBridgeImpl(private val webView: WebView) : JSViewBridge {

        @JavascriptInterface
        override fun postMessage(param: String) {
            val callbackJs = "javascript: window.AndroidJSServiceBridge.onmessage('$param');"
            webView.post { webView.evaluateJavascript(callbackJs, null) }
        }
    }

    // 创建一个Java接口，该接口将在WebView的JavaScript代码中暴露
    interface JSServiceBridge {
        fun postMessage(param: String)

    }

    class JSServiceBridgeImpl(private val webView: WebView) : JSServiceBridge {

        @JavascriptInterface
        override fun postMessage(param: String) {
            val callbackJs = "javascript: window.AndroidJSViewBridge.onmessage('$param');"
            webView.post { webView.evaluateJavascript(callbackJs, null) }
        }
    }
}
