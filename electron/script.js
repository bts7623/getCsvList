// 최초 csv 파일 담을 변수
let fullData = null;

// 추첨번호 입력 전처리
document.getElementById('selectNum').addEventListener('keyup', function(){
    var inputValue = document.getElementById('selectNum').value;
    document.getElementById('selectNum').value = inputValue.replace(/[^0-9,]/g, '');
});

// 추첨번호 입력유무 처리
document.getElementById('selectBtn').addEventListener('click', function(){
    var inputValue = document.getElementById('selectNum').value;
    var csvFileInput = document.getElementById('csvFileInput');
    if(inputValue === ''){
        alert('추첨번호를 입력해주세요');
        csvFileInput.disabled = true;
    }else{
        if(fullData){
            csvFileInput.disabled = true;
            const selectNums = splitSelectNum(inputValue);
            const data = exportData(fullData, selectNums);
            displayData(data);
        }else{
            csvFileInput.disabled = false;
            if (csvFileInput.files.length > 0) {
                processFile(csvFileInput.files[0]);
            }
        }   
    }
});

// CSV 파일 파싱
function parseCSV(text) {
    const lines = text.split('\n').map(line => line.split(','));
    return lines;
}

// selectNum 쪼개서 담음
function splitSelectNum(selectNum){
    const selectNums = selectNum.split(',')
                                .map(num => parseFloat(num.trim()))
                                .filter(num => !isNaN(num)); // 숫자가 아닌 값 제거
    const uniqueNums = [...new Set(selectNums)];

    const sortCheckbox = document.getElementById('sortCheckbox');
    if (sortCheckbox.checked) {
        uniqueNums.sort((a, b) => a - b);
    }

    return uniqueNums;
}

function displayData(data) {
    const header = data[0];
    const body = data.slice(1);

    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.querySelector('tbody');

    tableHeader.innerHTML = '';
    header.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tableHeader.appendChild(th);
    });

    tableBody.innerHTML = '';
    body.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// 추첨 번호 데이터만 추출
function exportData(fulldata, selectNums) {
    const exportArray = [];
    // 헤더를 exportArray에 추가
    exportArray.push(fulldata[0]);
    // 헤더를 제외한 데이터 부분
    const body = fulldata.slice(1);

    // selectNums 배열의 숫자와 일치하는 행을 exportArray에 추가
    selectNums.forEach((num) => {
        body.forEach((element) => {
            if (num == element[0]) {
                exportArray.push(element);
            }
        });
    });

    return exportArray;
}

// CSV 파일 처리 함수
function processFile(file) {
    const reader = new FileReader();
    const selectNum = document.getElementById('selectNum').value;
    const selectNums = splitSelectNum(selectNum);
    reader.onload = function(e) {
        const text = e.target.result;
        fullData = parseCSV(text);
        const data = exportData(fullData, selectNums);
        displayData(data);
    };
    reader.readAsText(file);
}

function getDownLoadDate(){
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return `${yy}${mm}${dd}_${hh}${mi}`;
}

// 엑셀 다운로드 기능 추가
document.getElementById('downloadBtn').addEventListener('click', function(){
    if(fullData){
        const dlDate = getDownLoadDate();
        const data = document.querySelectorAll('table tr');
        const ws_data = [];
    
        data.forEach(row => {
            const rowData = [];
            row.querySelectorAll('th, td').forEach(cell => {
                rowData.push(cell.textContent);
            });
            ws_data.push(rowData);
        });
    
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `infoPool_${dlDate}.xlsx`);
    }else{
        alert("조회된 내역이 없습니다.");
    }
});

// CSV 파일 선택 시 처리
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    processFile(file);
});
