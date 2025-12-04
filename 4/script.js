const inputNumbers = function (n) {
    let numbers = [];
    for (let i = 0; i < n; i++){
        let temp = +prompt(`Введіть цифрове значення №${i + 1}`);
        while (isNaN(temp) || !temp) {
            alert('Приймаються тільки цифрові значення!');
            temp = +prompt(`Введіть цифрове значення №${i + 1}`);
        }
        numbers.push(temp);
    }
    console.log(numbers);
    return numbers;
}

const CalcAvarage = function (n=3) {
    let numbers = inputNumbers(n);
    let temp;
    for (let i = 0; i < numbers.length; i++){
        for(let j = i; j < numbers.length; j++){
            if(numbers[i] === numbers[j+1]) {
            console.error('ПОМИЛКА! Рівні значення не допустимі.');
            alert('ПОМИЛКА! Рівні значення не допустимі.');
            return;
            }
        }
    }
    let summa = numbers.reduce((sum, currentItm) => sum + currentItm);
    let avg = summa / numbers.length;
    alert('Сума чисел: ' + summa + '\n' + 'Середнє арифметичне: ' + avg);
}

const ShowTriangle = function () {
    let size = +prompt(`Введіть розмір трикутника.` + `\n` + `Потрібне цифрове значення не менше 3 та не більше 12`);
    while(isNaN(size) || size < 3 || size > 12)
    {
        size = +prompt(`Потрібне цифрове значення не менше 3 та не більше 12` +`\n` + `Введіть розмір трикутника: `);
    }
    let triangle ='';
    for (let i = 0; i < size; i++){
        for (let j = 0; j <= i; j++){
            triangle += '*   ';
        }
        triangle += '\n';
    }
    alert('Ось ваш трикутник з розміром '+ size + '\n\n' + triangle);
}

FindMax = function (n=3) {
    let max = 0;
    let numbers = inputNumbers(n);
    for (let i = 0; i < numbers.length; i++){
        if(max < numbers[i]){
            max = numbers[i];
        }
    }
    alert('Всі числа які були введені: ' + numbers +'\n'+'Найбільше число з усіх введених: ' + max);
}

const CalcAB = function () {
    alert('Введіть 2 числа, але щоб друге число було більше ніж перше');
    let numbers = inputNumbers(2);
    let ANumber = numbers[0];
    let BNumber = numbers[1];
    while(ANumber >= BNumber){
        BNumber = +prompt('Введіть число більше ніж перше!' + '\n' + 'Перше число: ' + ANumber);
    }
    let sumAB = 0;
    let allNumbers = [];
    let oddNumbers = [];
    for (let i = ANumber; i <= BNumber; i++){
        allNumbers.push(i);
        sumAB += i;
        if(i % 2){
            oddNumbers.push(i);
        }
    }
    alert('Усі натуральні числа від А до В: ' + allNumbers + '\n' + 'Сума всіх натуральних чисел від А до В: ' + sumAB + '\n' + 'Усі непарні числа від А до В: ' + oddNumbers);
}

const MultipleTable = function () {
    for (let i = 0; i < 10; i++){
        let oneColum = '';
        for (let j = 0; j <= 10; j++){
            oneColum += `${i} •  ${j} = ${i * j};\n`;
        }
        document.getElementById(i).innerText =oneColum;
    }
}

const FibNumbers = function () {
    let n = +prompt('З якою кількістю елементів буде складатися ряд чисел Фібоначчі?' + '\n' + 'Потрібне цифрове значеня неменше 3: ');
    let fib = [];
    let a = 0;
    let b = 1;
    let c;
    while(isNaN(n) || n < 3){
        n = +prompt('Потрібне цифрове значеня неменше 3: ');
    }
    for (let i = 0; i < n; i++){
        c = a + b;
        a = b;
        fib.push(a);
        b = c
    }
    alert(fib);
}

//CalcAvarage();
//ShowTriangle();
//FindMax();
//CalcAB();
//FibNumbers();
MultipleTable();