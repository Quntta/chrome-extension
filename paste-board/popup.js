document.getElementById('modifyClipboard').addEventListener('click', async function () {
    let text = await navigator.clipboard.readText();
    let modifiedText = text + " modified"; // 修改剪贴板的内容
    await navigator.clipboard.writeText(modifiedText);
});