# VisualMathEditor-TinyMCE
Integrates Visual Math Editor into TinyMCE


Usage:


- copy the plugin resources (visualmatheditor folder) into the plugin folder of the TinyMCE installation
- add MathJax to the page containing the TinyMCE Textarea

```html
		<script type="text/x-mathjax-config">
			MathJax.Hub.Config({
				jax: ["input/TeX", "output/SVG"],
				extensions: ["tex2jax.js", "MathMenu.js", "MathZoom.js"],
				showMathMenu: false,
				showProcessingMessages: false,
				messageStyle: "none",
				SVG: {
					useGlobalCache: false
				},
				TeX: {
					extensions: ["AMSmath.js", "AMSsymbols.js", "autoload-all.js"]
				}
			});
		</script>
		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js"></script>
```



- add the visualmatheditor plugin to the TinyMCE initialisation
