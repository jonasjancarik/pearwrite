// --- status pill (kept out of print and out of the document's own flow) ---
// Colours come in light-dark() pairs, so the editor follows the page's own color-scheme: a page with dark colours that
// sets color-scheme:dark gets the dark ones, and every other page keeps the light ones, as before.
const style = document.createElement("style");
style.dataset.pearwriteUi = "";
style.textContent = `
  [data-id][contenteditable]{outline:none;border-radius:2px;transition:box-shadow .15s}
  [data-id][contenteditable]:hover{box-shadow:0 0 0 2px light-dark(#4a7bd433,#7ea5ef40)}
  [data-id][contenteditable]:focus{box-shadow:0 0 0 2px light-dark(#4a7bd4aa,#7ea5efaa)}
  [data-id].pearwrite-conflict{box-shadow:0 0 0 2px #d4734a!important}
  [data-id].pearwrite-changed{background-color:#c4b2ff38!important}
  [data-id].pearwrite-changed-fade{animation:pearwrite-ink .9s cubic-bezier(.2,.7,.2,1),pearwrite-shimmer 1.6s cubic-bezier(.4,0,.2,1) .1s,
    pearwrite-glow 3s ease-out,pearwrite-fade 2.6s ease-in 1.8s both}
  @keyframes pearwrite-ink{from{opacity:.25;filter:blur(3px)}to{opacity:1;filter:blur(0)}}
  @keyframes pearwrite-fade{from{background-color:#c4b2ff38}}
  @keyframes pearwrite-shimmer{from,to{background-image:linear-gradient(105deg,transparent 28%,#f6c3e033 40%,#fff6dcd9 50%,#cdbdff66 60%,transparent 72%);
    background-size:320% 100%;background-repeat:no-repeat}from{background-position:100% 0}to{background-position:0 0}}
  @keyframes pearwrite-glow{from,to{box-shadow:0 0 0 1px #a58bff00,0 0 0 #f29fc500,0 0 0 #9b7bff00}
    22%{box-shadow:0 0 0 1px #b39cffa6,-10px 2px 26px #f29fc54d,10px -2px 26px #9b7bff59}}
  .pearwrite-sparkle{position:fixed;z-index:2147483646;pointer-events:none;display:block;
    filter:drop-shadow(0 0 3px currentColor) drop-shadow(0 0 7px currentColor);animation:pearwrite-sparkle var(--t) cubic-bezier(.2,.6,.3,1) both}
  .pearwrite-sparkle svg{display:block;width:100%;height:100%}
  .pearwrite-sparkle.dot{border-radius:50%;background:currentColor}
  @keyframes pearwrite-sparkle{from{opacity:0;transform:translate(0,0) scale(0) rotate(0)}
    30%{opacity:1;transform:translate(calc(var(--dx)*.35),calc(var(--dy)*.35)) scale(1) rotate(calc(var(--rot)*.4))}
    to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2) rotate(var(--rot))}}
  #pearwrite-status[data-owner=changes]{opacity:.96;border:1px solid transparent;padding:6px 11px 6px 9px;
    background:linear-gradient(light-dark(#1f2a24,#2f3b35),light-dark(#1f2a24,#2f3b35)) padding-box,linear-gradient(100deg,#9b7bff,#f29fc5,#e9c46a,#9b7bff) 0 0/300% 100% border-box;
    animation:pearwrite-border 5s linear infinite}
  @keyframes pearwrite-border{to{background-position:0 0,300% 0}}
  #pearwrite-status .star{display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-1.5px;color:#f1d27a;
    filter:drop-shadow(0 0 3px #f1d27a99);animation:pearwrite-twinkle 1.4s ease-in-out 2}
  #pearwrite-status .star svg{display:block;width:100%;height:100%}
  @keyframes pearwrite-twinkle{50%{transform:scale(.6) rotate(45deg);opacity:.6}}
  @media (prefers-reduced-motion:reduce){[data-id].pearwrite-changed-fade{animation:pearwrite-fade 4.4s steps(1,end) both}.pearwrite-sparkle{display:none}
    #pearwrite-status[data-owner=changes],#pearwrite-status .star{animation:none}}
  #pearwrite-status{position:fixed;right:14px;bottom:14px;z-index:2147483647;font:12px/1.3 -apple-system,system-ui,sans-serif;
    background:light-dark(#1f2a24,#2f3b35);color:#fff;padding:7px 11px;border-radius:7px;box-shadow:0 3px 12px light-dark(#0003,#0009);max-width:340px;opacity:.88}
  #pearwrite-status[data-kind=error]{background:#9c3b1c}
  #pearwrite-status button{all:unset;margin-left:10px;font-weight:600;text-decoration:underline;cursor:pointer}
  .pearwrite-grip{position:fixed;z-index:2147483646;width:18px;height:22px;padding:0;margin:0;border:0;border-radius:4px;
    background:light-dark(#fff,#1d2421);color:light-dark(#7a8580,#95a09a);box-shadow:0 1px 4px light-dark(#0002,#0008);font:14px/22px system-ui,sans-serif;letter-spacing:-3px;
    text-align:center;cursor:grab;user-select:none;touch-action:none}
  .pearwrite-grip:hover{color:light-dark(#1f2a24,#e6ebe8);background:light-dark(#eef2fb,#1f2b40)}
  .pearwrite-add{letter-spacing:0;font-size:17px;cursor:pointer}
  html.pearwrite-plain-links [data-id][contenteditable=true] a{text-decoration:underline}
  [data-id][contenteditable]:empty{min-height:1.2em}
  [data-id][contenteditable]:empty:focus::before{content:"Type here";color:light-dark(#9aa39e,#6f7a74);pointer-events:none}
  #pearwrite-outline{position:fixed;z-index:2147483645;pointer-events:none;border:2px solid light-dark(#4a7bd4aa,#7ea5efaa);border-radius:3px}
  #pearwrite-marker{position:fixed;z-index:2147483646;pointer-events:none;background:#4a7bd4;border-radius:2px}
  #pearwrite-tip{position:fixed;z-index:2147483647;display:none;box-sizing:border-box;max-width:min(360px,calc(100vw - 16px));
    padding:5px 9px;border-radius:7px;background:light-dark(#fff,#1d2421);color:light-dark(#1f2a24,#e6ebe8);box-shadow:0 3px 14px light-dark(#0003,#0009),0 0 0 1px light-dark(#0000000f,#ffffff17);
    font:13px/1.4 -apple-system,system-ui,sans-serif;overflow-wrap:anywhere;pointer-events:none}
  #pearwrite-tip del{padding:0 2px;border-radius:3px;background:light-dark(#fbe9e3,#40241c);color:light-dark(#a1452a,#f2a58c);text-decoration:line-through;
    text-decoration-color:light-dark(#a1452a88,#f2a58c99)}
  @media print{#pearwrite-tip{display:none!important}}
  .pearwrite-dragging{opacity:.35}
  html.pearwrite-is-dragging,html.pearwrite-is-dragging *{cursor:grabbing!important;user-select:none!important}
  #pearwrite-toolbar{position:fixed;z-index:2147483647;display:none;align-items:center;gap:2px;padding:3px;border-radius:8px;
    background:light-dark(#1f2a24,#2f3b35);box-shadow:0 3px 12px light-dark(#0004,#000a);font:13px/1 -apple-system,system-ui,sans-serif}
  #pearwrite-toolbar button{all:unset;box-sizing:border-box;min-width:28px;height:28px;padding:0 7px;border-radius:5px;
    color:#e8ece9;text-align:center;line-height:28px;cursor:pointer;font:inherit}
  #pearwrite-toolbar button:hover{background:#ffffff1f}
  #pearwrite-toolbar button[aria-pressed=true]{background:#ffffff33;color:#fff}
  #pearwrite-toolbar .sep{width:1px;height:18px;margin:0 4px;background:#ffffff33}
  #pearwrite-toolbar form{display:none;gap:4px;margin:0}
  #pearwrite-toolbar input{all:unset;box-sizing:border-box;width:240px;height:28px;padding:0 8px;border-radius:5px;
    background:light-dark(#fff,#1d2421);color:light-dark(#1f2a24,#e6ebe8);font:inherit}
  #pearwrite-toolbar.comment-only > :not([data-comment]){display:none}
  #pearwrite-toolbar.linking > :not(form){display:none}
  #pearwrite-toolbar.linking form{display:flex}
  #pearwrite-corner{all:unset;box-sizing:border-box;position:fixed;left:14px;bottom:14px;z-index:2147483647;display:none;
    align-items:center;justify-content:center;gap:7px;height:36px;padding:0 13px 0 9px;border-radius:18px;background:light-dark(#1f2a24,#2f3b35);color:#e8ece9;font-weight:600;
    font:12px/1.3 -apple-system,system-ui,sans-serif;cursor:pointer;box-shadow:0 3px 12px light-dark(#0003,#0009)}
  #pearwrite-corner.shown{display:flex}
  #pearwrite-corner:hover{background:light-dark(#34433a,#3c4a43)}
  #pearwrite-corner:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef);outline-offset:2px}
  #pearwrite-corner svg{width:20px;height:20px}
  #pearwrite-corner .dot{position:absolute;top:0;right:0;width:9px;height:9px;border-radius:50%;background:#b39cff;
    box-shadow:0 0 0 2px light-dark(#fff,#1d2421),0 0 8px #9b7bff}
  #pearwrite-corner.stash{width:auto;height:auto;padding:7px 12px;border-radius:7px;background:#9c3b1c;color:#fff}
  #pearwrite-corner.stash:hover{background:#b4461f}
  #pearwrite-changes{position:fixed;left:14px;bottom:60px;z-index:2147483647;display:none;flex-direction:column;box-sizing:border-box;
    width:min(380px,calc(100vw - 28px));max-height:min(70vh,560px);overflow:hidden;border-radius:12px;background:light-dark(#fff,#1d2421);color:light-dark(#1f2a24,#e6ebe8);
    box-shadow:0 12px 40px light-dark(#0003,#0009),0 0 0 1px light-dark(#0000000f,#ffffff17);font:13px/1.45 -apple-system,system-ui,sans-serif;text-align:left}
  #pearwrite-changes.open{display:flex}
  #pearwrite-changes header{all:unset;display:block;padding:12px 10px 0 16px;border-bottom:1px solid light-dark(#e4e8e5,#323c37)}
  #pearwrite-changes header .title{display:flex;align-items:center;justify-content:space-between}
  #pearwrite-changes .views{display:flex;flex-wrap:wrap;gap:4px 16px;padding:6px 0 10px}
  #pearwrite-changes h2{all:unset;font-size:14px;font-weight:600}
  #pearwrite-changes .x{all:unset;cursor:pointer;color:light-dark(#7a8580,#95a09a);font-size:20px;line-height:1;padding:2px 7px 4px;border-radius:6px}
  #pearwrite-changes .x:hover{background:light-dark(#eef1ef,#2d3632);color:light-dark(#1f2a24,#e6ebe8)}
  #pearwrite-changes footer{padding:8px 16px;border-top:1px solid light-dark(#e4e8e5,#323c37);color:light-dark(#7a8580,#95a09a);font-size:11.5px;user-select:text;word-break:break-all}
  #pearwrite-changes .list{overflow:auto;padding:8px 8px 8px}
  #pearwrite-changes .agent-status{margin:0;padding-right:6px;font-size:12px;color:light-dark(#7a8580,#95a09a)}
  ::highlight(pearwrite-comment){background-color:light-dark(#ffe08a,#6e5713)}
  ::highlight(pearwrite-comment-draft){background-color:light-dark(#ffe08a,#6e5713)}
  ::highlight(pearwrite-agent-comment){background-color:light-dark(#cfe0fb,#26426e)}
  #pearwrite-comment-layer .marker{all:unset;box-sizing:border-box;position:fixed;z-index:2147483646;min-width:20px;height:20px;padding:0 5px;
    border-radius:10px 10px 10px 3px;background:#e0a800;color:#1f2a24;font:600 11px/20px -apple-system,system-ui,sans-serif;
    text-align:center;cursor:pointer;box-shadow:0 1px 4px #0003}
  #pearwrite-comment-layer .marker.agent{background:#4a7bd4;color:#fff}
  #pearwrite-comment-layer .marker:focus-visible{outline:2px solid #4a7bd4;outline-offset:2px}
  #pearwrite-seen-layer .seen{position:fixed;z-index:2147483645;box-sizing:border-box;width:20px;height:20px;display:flex;
    align-items:center;justify-content:center;border-radius:10px;background:light-dark(#fff,#1d2421);color:light-dark(#4a7bd4,#7ea5ef);box-shadow:0 1px 3px light-dark(#0002,#0008);
    opacity:.8;transition:opacity .4s,transform .25s}
  #pearwrite-seen-layer .seen svg{width:13px;height:13px}
  #pearwrite-seen-layer .seen[data-mark=done]{color:light-dark(#2f8a57,#6fbf93)}
  #pearwrite-seen-layer .seen.new{opacity:0;transform:scale(.6)}
  #pearwrite-seen-layer .seen.fading{opacity:0}
  @media (prefers-reduced-motion:reduce){#pearwrite-seen-layer .seen{transition:none}}
  #pearwrite-comment-here{all:unset;position:fixed;z-index:2147483646;display:none;padding:3px 9px;border-radius:6px;background:light-dark(#1f2a24,#2f3b35);
    color:#e8ece9;font:12px/1.4 -apple-system,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px light-dark(#0003,#0009)}
  #pearwrite-comment-here:hover{background:light-dark(#34433a,#3c4a43)}
  #pearwrite-comment-box{position:fixed;z-index:2147483647;display:none;box-sizing:border-box;width:min(320px,calc(100vw - 16px));
    max-height:min(60vh,420px);overflow:auto;padding:10px;border-radius:10px;background:light-dark(#fff,#1d2421);color:light-dark(#1f2a24,#e6ebe8);
    box-shadow:0 10px 32px light-dark(#0003,#0009),0 0 0 1px light-dark(#0000000f,#ffffff17);font:13px/1.45 -apple-system,system-ui,sans-serif;text-align:left}
  #pearwrite-comment-box.open{display:block}
  #pearwrite-comment-box textarea,#pearwrite-changes .comment textarea{box-sizing:border-box;width:100%;min-height:60px;margin:0;padding:6px 8px;
    border:1px solid light-dark(#cfd6d2,#46514b);border-radius:6px;background:light-dark(#fff,#1d2421);color:light-dark(#1f2a24,#e6ebe8);font:inherit;resize:vertical}
  #pearwrite-comment-box .actions{display:flex;justify-content:flex-end;gap:6px;margin-top:8px}
  #pearwrite-comment-box .actions button{all:unset;padding:5px 10px;border-radius:6px;background:light-dark(#eef1ef,#2d3632);cursor:pointer}
  #pearwrite-comment-box .actions button.primary{background:light-dark(#1f2a24,#e6ebe8);color:light-dark(#fff,#1f2a24)}
  #pearwrite-comment-box .comment+.comment{margin-top:8px;padding-top:8px;border-top:1px solid light-dark(#eef1ef,#2b3430)}
  #pearwrite-comment-box p,#pearwrite-changes .comment p{margin:0 0 4px}
  #pearwrite-comment-box .quote,#pearwrite-changes .comment .quote{padding-left:8px;border-left:3px solid #e0a800;color:light-dark(#56615b,#b4beb8)}
  #pearwrite-comment-box .agent .quote,#pearwrite-changes .comment.agent .quote{border-left-color:light-dark(#4a7bd4,#7ea5ef)}
  #pearwrite-comment-box .about,#pearwrite-changes .comment .about,#pearwrite-changes .comment .lost{color:light-dark(#7a8580,#95a09a);font-size:12px}
  #pearwrite-comment-box .quote.old,#pearwrite-changes .comment .quote.old{border-left-color:light-dark(#cfd6d2,#46514b);text-decoration:line-through}
  #pearwrite-comment-box .text,#pearwrite-changes .comment .text{white-space:pre-wrap;overflow-wrap:anywhere}
  #pearwrite-comment-box .choices,#pearwrite-changes .comment .choices{display:flex;flex-direction:column;align-items:flex-start;gap:3px;margin:5px 0}
  #pearwrite-comment-box .choices button,#pearwrite-changes .comment .choices button{all:unset;box-sizing:border-box;max-width:100%;padding:2px 8px;font-size:12px;
    border:1px solid light-dark(#b9cbec,#3d5584);border-radius:5px;color:light-dark(#2d4f8f,#a5c0f3);cursor:pointer;overflow-wrap:anywhere}
  #pearwrite-comment-box .choices button:hover,#pearwrite-changes .comment .choices button:hover{background:light-dark(#eaf0fb,#1f2b40)}
  #pearwrite-comment-box .choices button.own,#pearwrite-changes .comment .choices button.own{border-color:transparent;color:light-dark(#7a8580,#95a09a)}
  #pearwrite-comment-box .choices button.own:hover,#pearwrite-changes .comment .choices button.own:hover{background:none;color:light-dark(#2d4f8f,#a5c0f3);text-decoration:underline}
  #pearwrite-comment-box .choices button:focus-visible,#pearwrite-changes .comment .choices button:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef);outline-offset:1px}
  #pearwrite-comment-box .reply,#pearwrite-changes .comment .reply{color:light-dark(#56615b,#b4beb8)}
  #pearwrite-comment-box .meta,#pearwrite-changes .comment .meta{display:flex;align-items:baseline;gap:12px;margin-top:6px;font-size:12px;color:light-dark(#7a8580,#95a09a)}
  #pearwrite-comment-box .meta span,#pearwrite-changes .comment .meta span{margin-right:auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #pearwrite-comment-box .meta button,#pearwrite-changes .comment .meta button,#pearwrite-changes .comments .clear{all:unset;cursor:pointer;
    color:light-dark(#3d4842,#c3ccc7);font-weight:500;white-space:nowrap}
  #pearwrite-comment-box .meta button:hover,#pearwrite-changes .comment .meta button:hover,#pearwrite-changes .comments .clear:hover,
    #pearwrite-comment-box .meta button:focus-visible,#pearwrite-changes .comment .meta button:focus-visible{color:light-dark(#1f2a24,#e6ebe8);text-decoration:underline}
  #pearwrite-changes .comments{margin:0 0 8px;padding:0 8px 8px;border-bottom:1px solid light-dark(#eef1ef,#2b3430)}
  #pearwrite-changes .comments h3{all:unset;display:block;margin:4px 0 4px;font-size:12px;font-weight:600;color:light-dark(#56615b,#b4beb8)}
  #pearwrite-changes .comment{padding:6px 0}
  #pearwrite-changes .comment.goes-to{margin:0 -8px;padding:6px 8px;border-radius:8px;cursor:pointer}
  #pearwrite-changes .comment.goes-to:hover{background:light-dark(#f5f7f6,#252d29)}
  #pearwrite-changes .comment.done{opacity:.6}
  #pearwrite-changes .comments .clear{display:block;margin-top:4px;font-size:12px}
  #pearwrite-changes .aside{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 8px;padding:9px 11px;
    border-radius:8px;background:light-dark(#fbefe9,#3a2319);color:light-dark(#7a2e14,#f2b49c)}
  #pearwrite-changes .aside button{all:unset;cursor:pointer;font-weight:600;text-decoration:underline;white-space:nowrap}
  #pearwrite-changes .entry{padding:9px 0 5px;border-top:1px solid light-dark(#eef1ef,#2b3430)}
  #pearwrite-changes .entry:first-child{border-top:0}
  #pearwrite-changes .who{display:flex;align-items:center;gap:6px;padding:0 8px 2px;font-size:12px;font-weight:600}
  #pearwrite-changes .who .when{margin-left:auto;font-weight:400;color:light-dark(#7a8580,#95a09a)}
  #pearwrite-changes .who .star{display:block;width:12px;height:12px;color:#9b7bff;filter:drop-shadow(0 0 3px #b39cff88)}
  #pearwrite-changes .who .star svg{display:block;width:100%;height:100%}
  #pearwrite-changes ul{all:unset;display:block;list-style:none}
  #pearwrite-changes li{display:block}
  #pearwrite-changes .change{all:unset;box-sizing:border-box;display:block;width:100%;padding:5px 8px;border-radius:7px}
  #pearwrite-changes button.change{cursor:pointer}
  #pearwrite-changes button.change:hover{background:light-dark(#f4f1ff,#2a2442)}
  #pearwrite-changes button.change:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef)}
  #pearwrite-changes .kind{display:block;margin-bottom:1px;font-size:11px;color:light-dark(#7a8580,#95a09a)}
  #pearwrite-changes .text{display:block;overflow-wrap:anywhere}
  #pearwrite-changes del{padding:0 2px;border-radius:3px;background:light-dark(#fbe9e3,#40241c);color:light-dark(#a1452a,#f2a58c);text-decoration:line-through;
    text-decoration-color:light-dark(#a1452a88,#f2a58c99)}
  #pearwrite-changes ins{padding:0 2px;border-radius:3px;background:light-dark(#ece5ff,#30275a);color:light-dark(#3d2a85,#d3c8ff);text-decoration:none}
  #pearwrite-changes .entry[data-by=you] .who,#pearwrite-changes .entry[data-by=you] .text{color:light-dark(#5b6660,#a9b3ad)}
  #pearwrite-changes .entry[data-by=you] ins{background:light-dark(#e9eeeb,#2d3632);color:light-dark(#1f2a24,#e6ebe8)}
  #pearwrite-changes .access{margin:0 0 8px;padding:9px 11px;border-radius:8px;background:light-dark(#f1f3f0,#252d29);color:light-dark(#3d4a43,#c3ccc7)}
  #pearwrite-changes .empty{margin:0;padding:4px 8px 10px;color:light-dark(#7a8580,#95a09a)}
  #pearwrite-changes .review-switch{display:flex;align-items:center;gap:6px;font-size:12px;color:light-dark(#3d4a43,#c3ccc7);cursor:pointer;user-select:none}
  #pearwrite-changes .review-switch input{margin:0;accent-color:#6a52c9}
  #pearwrite-changes .authors-switch{display:flex;align-items:center;gap:6px;font-size:12px;color:light-dark(#3d4a43,#c3ccc7);cursor:pointer;user-select:none}
  #pearwrite-changes .authors-switch input{margin:0;accent-color:#3f8f5c}
  #pearwrite-authors-layer{position:absolute;top:0;left:0;width:0;height:0;z-index:2147483644}
  #pearwrite-authors-layer .bar{position:absolute;width:10px;cursor:default;pointer-events:auto}
  #pearwrite-authors-layer .bar::after{content:"";position:absolute;left:3px;top:0;bottom:0;width:3px;border-radius:2px;background:var(--by)}
  html.pearwrite-reviewing #pearwrite-authors-layer{display:none}
  #pearwrite-pending-layer{position:absolute;top:0;left:0;width:0;height:0;z-index:2147483644}
  #pearwrite-pending-layer .bar{position:absolute;width:10px;cursor:default;pointer-events:auto}
  #pearwrite-pending-layer .bar::after{content:"";position:absolute;left:3px;top:0;bottom:0;width:3px;border-radius:2px;background:#4a7bd4}
  #pearwrite-pending-actions{position:absolute;z-index:2147483646;display:none;gap:2px;padding:2px;border-radius:7px;background:light-dark(#fff,#1d2421);
    box-shadow:0 1px 4px light-dark(#0002,#0008),0 0 0 1px light-dark(#d9e0dc,#3a4540);font:12px/1.2 -apple-system,system-ui,sans-serif}
  #pearwrite-pending-actions button{all:unset;padding:3px 9px;border-radius:5px;cursor:pointer;color:light-dark(#1f2a24,#e6ebe8);font-weight:600}
  #pearwrite-pending-actions button:hover{background:light-dark(#eaf0fb,#1f2b40)}
  #pearwrite-pending-actions button:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef)}
  #pearwrite-pending-actions button:disabled{color:light-dark(#a0a8a4,#68726d);cursor:default;background:none}
  html.pearwrite-reviewing #pearwrite-pending-layer,html.pearwrite-reviewing #pearwrite-pending-actions{display:none!important}
  #pearwrite-changes .to-review{margin:0 0 8px;padding:0 0 8px;border-bottom:1px solid light-dark(#eef1ef,#2b3430)}
  #pearwrite-changes .to-review .head{display:flex;align-items:center;gap:8px;padding:0 8px 4px}
  #pearwrite-changes .to-review h3{all:unset;margin-right:auto;font-size:12px;font-weight:600;color:light-dark(#56615b,#b4beb8)}
  #pearwrite-changes .to-review li{position:relative}
  #pearwrite-changes .to-review .kind{padding-right:104px;line-height:20px}
  #pearwrite-changes .to-review .why{margin:-2px 8px 6px 8px;padding:5px 9px;border-radius:6px;background:light-dark(#f3f6fc,#1c2638);box-shadow:inset 2px 0 0 light-dark(#4a7bd4,#7ea5ef);
    font-size:12px;line-height:1.4;color:light-dark(#3b4a5e,#c2cde0)}
  #pearwrite-changes .to-review .why-label{margin-right:6px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:light-dark(#4a7bd4,#7ea5ef)}
  #pearwrite-changes .to-review .acts{position:absolute;top:5px;right:8px;display:flex;gap:4px}
  #pearwrite-changes .to-review .keep-all,#pearwrite-changes .to-review .act{all:unset;flex:none;padding:1px 9px;border-radius:6px;cursor:pointer;
    font-size:12px;line-height:16px;font-weight:500;color:light-dark(#1f2a24,#e6ebe8);background:light-dark(#fff,#1d2421);box-shadow:inset 0 0 0 1px light-dark(#d4dad6,#46514b)}
  #pearwrite-changes .to-review .keep-all{background:#4a7bd4;color:#fff;box-shadow:none}
  #pearwrite-changes .to-review .keep-all:hover{background:#3d6bc0}
  #pearwrite-changes .to-review .act:hover{background:light-dark(#f1f4f2,#2d3632)}
  #pearwrite-changes .to-review .keep-all:focus-visible,#pearwrite-changes .to-review .act:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef);outline-offset:1px}
  #pearwrite-changes .to-review .act:disabled{color:light-dark(#a0a8a4,#68726d);cursor:default;background:light-dark(#fff,#1d2421)}
  #pearwrite-changes .to-review .copy{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:0 8px 6px;font-size:12px;color:light-dark(#56615b,#b4beb8)}
  #pearwrite-changes .to-review .copy span{margin-right:4px}
  #pearwrite-changes .to-review .copy-left{margin:0 8px 6px;padding:6px 8px;border-radius:6px;background:light-dark(#fbf3e4,#362d1c);font-size:12px;color:light-dark(#5b4a2a,#e8cf9c)}
  #pearwrite-changes .to-review .copy-left p{margin:0 0 2px}
  #pearwrite-changes .to-review .copy-left ul{margin:0;padding-left:16px}
  #pearwrite-changes .to-review .copy-left li{list-style:disc}
  #pearwrite-announce{position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  #pearwrite-review-bar{position:fixed;top:0;left:0;right:0;z-index:2147483647;display:flex;flex-wrap:wrap;align-items:center;
    gap:6px 16px;padding:9px 16px;background:light-dark(#1f2a24,#2f3b35);color:#fff;font:13px/1.35 -apple-system,system-ui,sans-serif;
    box-shadow:0 2px 10px light-dark(#0003,#0009)}
  #pearwrite-review-bar .what{flex:1 1 260px}
  #pearwrite-review-bar label{display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap}
  #pearwrite-review-bar label input{margin:0;accent-color:#b39cff}
  #pearwrite-review-bar button{all:unset;padding:4px 12px;border-radius:6px;background:#fff;color:#1f2a24;font-weight:600;cursor:pointer}
  #pearwrite-review-bar button:focus-visible{outline:2px solid #b39cff}
  #pearwrite-review-bar .removed{flex-basis:100%;margin:0;color:#d5dcd8}
  #pearwrite-review-bar .removed del{color:#f3c3b3}
  html.pearwrite-reviewing [data-id][contenteditable]{box-shadow:none!important}
  #pearwrite-review-layer{position:absolute;top:0;left:0;width:0;height:0;z-index:2147483645}
  .pearwrite-review-label{position:absolute;display:flex;flex-direction:column;align-items:flex-end;padding:1px 6px;border-radius:5px;
    background:light-dark(#ece5ff,#30275a);color:light-dark(#3d2a85,#d3c8ff);font:11px/1.45 -apple-system,system-ui,sans-serif;white-space:nowrap;pointer-events:none}
  ins.pearwrite-ins{background:light-dark(#ece5ff,#30275a);color:light-dark(#3d2a85,#d3c8ff);text-decoration:none;border-radius:2px;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  del.pearwrite-del{background:light-dark(#fbe9e3,#40241c);color:light-dark(#a1452a,#f2a58c);text-decoration:line-through;text-decoration-color:light-dark(#a1452a99,#f2a58c99);border-radius:2px;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pearwrite-ghost{opacity:.85}
  .pearwrite-ghost td{text-align:start}
  ol > li.pearwrite-ghost{display:block}
  [data-id].pearwrite-review-new{background-color:#c4b2ff38!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @media print{#pearwrite-review-bar,#pearwrite-review-spacer,#pearwrite-review-layer,#pearwrite-authors-layer,#pearwrite-pending-layer,#pearwrite-pending-actions{display:none!important}}
  #pearwrite-changes li.undoable{display:flex;align-items:flex-start}
  #pearwrite-changes .undo{all:unset;flex:none;margin:5px 4px 0;padding:0 6px;border-radius:5px;cursor:pointer;font-size:12px;
    font-weight:600;color:light-dark(#3d2a85,#d3c8ff);text-decoration:underline}
  #pearwrite-changes .undo:hover{background:light-dark(#f4f1ff,#2a2442)}
  #pearwrite-changes .undo:focus-visible{outline:2px solid light-dark(#4a7bd4,#7ea5ef)}
  #pearwrite-stash{position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-start;justify-content:center;
    padding:48px 16px;background:light-dark(#1f2a2466,#000000a6);overflow:auto;font:14px/1.45 -apple-system,system-ui,sans-serif;color:light-dark(#1f2a24,#e6ebe8)}
  #pearwrite-stash.open{display:flex}
  #pearwrite-stash .panel{box-sizing:border-box;width:min(760px,100%);background:light-dark(#fff,#1d2421);border-radius:10px;padding:20px 22px;
    box-shadow:0 12px 40px light-dark(#0004,#000a)}
  #pearwrite-stash h2{all:unset;display:block;font-size:17px;font-weight:600;margin:0 0 4px}
  #pearwrite-stash .intro{margin:0 0 14px;color:light-dark(#5b6660,#a9b3ad)}
  #pearwrite-stash .entry{border-top:1px solid light-dark(#e4e8e5,#323c37);padding:14px 0}
  #pearwrite-stash .cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media (max-width:560px){#pearwrite-stash .cols{grid-template-columns:1fr}}
  #pearwrite-stash .col h3{all:unset;display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;
    color:light-dark(#7a8580,#95a09a);margin-bottom:4px}
  #pearwrite-stash .col div{white-space:pre-wrap;background:light-dark(#f4f6f5,#252d29);border-radius:6px;padding:8px 10px;max-height:220px;overflow:auto}
  #pearwrite-stash .mine div{background:light-dark(#fbefe9,#3a2319)}
  #pearwrite-stash .note{margin:10px 0 0;color:light-dark(#9c3b1c,#ef8f7a)}
  #pearwrite-stash .actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  #pearwrite-stash button{all:unset;box-sizing:border-box;padding:6px 11px;border-radius:6px;background:light-dark(#eef1ef,#2d3632);cursor:pointer;
    font:13px/1.2 -apple-system,system-ui,sans-serif;color:light-dark(#1f2a24,#e6ebe8)}
  #pearwrite-stash button:hover{background:light-dark(#e0e5e2,#36413c)}
  #pearwrite-stash button.primary{background:light-dark(#1f2a24,#e6ebe8);color:light-dark(#fff,#1f2a24)}
  #pearwrite-stash button.primary:hover{background:light-dark(#34433a,#fff)}
  #pearwrite-stash .close{float:right}
  @media print{#pearwrite-status,#pearwrite-ui,#pearwrite-toolbar,#pearwrite-stash,#pearwrite-corner,#pearwrite-changes,#pearwrite-comment-layer,#pearwrite-seen-layer,#pearwrite-comment-box,#pearwrite-comment-here{display:none!important}::highlight(pearwrite-comment),::highlight(pearwrite-agent-comment){background-color:transparent}[data-id][contenteditable]{box-shadow:none!important}.pearwrite-sparkle{display:none!important}
    [data-id].pearwrite-changed,[data-id].pearwrite-changed-fade{background-color:transparent!important;animation:none!important}}`;
document.head.append(style);
