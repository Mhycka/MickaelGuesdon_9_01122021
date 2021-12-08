import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"


export default (billUrl, fileName) => {
  const regexFileViewable = new RegExp('^.*\.(jpg|jpeg|gif|png)$', "i");
  const regexFileDownloadable = new RegExp('^.*\.(pdf)$', "i");

  if (regexFileViewable.test(fileName)) {// Modal viewer
    return `
    <div class="icon-actions">
      <div data-testid="icon-eye" data-bill-url="${billUrl}">${eyeBlueIcon}</div>
    </div>
    `;
  } else if (regexFileDownloadable.test(fileName)) {// Link to download
    return `
      <div class="icon-actions">
        <a href="${billUrl}" download="${fileName}" target="blank" data-testid="icon-download">${downloadBlueIcon}</a>
      </div>
      `;
    } else {// unrecognized type
      return '';
    }

}