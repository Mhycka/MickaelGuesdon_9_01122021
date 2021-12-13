import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"


export default (billUrl, fileName) => {
  const regexFileView = new RegExp('^.*\.(jpg|jpeg|gif|png)$', "i");
  const regexFileDL = new RegExp('^.*\.(pdf)$', "i");

  if (regexFileView.test(fileName)) {
    return `
    <div class="icon-actions">
      <div data-testid="icon-eye" data-bill-url="${billUrl}">${eyeBlueIcon}</div>
    </div>
    `;
  } else if (regexFileDL.test(fileName)) {
    return `
      <div class="icon-actions">
        <a href="${billUrl}" download="${fileName}" target="blank" data-testid="icon-download">${downloadBlueIcon}</a>
      </div>
      `;
    } else {
      return '';
    }
}