import * as fs from 'fs'
/**
 * 
 * racuna razliku u kosevima i dodaje nove meceve u fajl opet
 * @param {*} team1 
 * @param {*} team2 
 * @returns 
 */
export function playGame(team1, team2) {
    const osnovno = Math.random() * 70 + 50;
    const razlikaKoseva = Math.random() * 15;
    calculateFormu([team1, team2]);

    const formTeam1 = team1.forma;
    const formTeam2 = team2.forma; 

    const boljiTim = team1.FIBARanking - team2.FIBARanking;
    const rangUticaj = boljiTim * 0.3; 

    const kosevi1 = Math.max(0, Math.round(osnovno + (formTeam1 * 50) - (formTeam2 * 50) + rangUticaj));
    const kosevi2 = Math.max(0, Math.round(osnovno - razlikaKoseva + (formTeam2 * 50) - (formTeam1 * 50) - rangUticaj));
 
    updateExhibitions(team1, team2, kosevi1, kosevi2)
    return {
        team1Res: kosevi1,
        team2Res: kosevi2
    };
}

async function updateExhibitions(team1, team2, team1Points, team2Points) {
    try {
        const data = fs.readFileSync('./data_files/exibitions.json', 'utf8');
        const exhibitions = JSON.parse(data);

        const date = new Date().toISOString().split('T')[0];

        if (!exhibitions[team1.ISOCode]) {
            exhibitions[team1.ISOCode] = [];
        }
        if (!exhibitions[team2.ISOCode]) {
            exhibitions[team2.ISOCode] = [];
        }

        exhibitions[team1.ISOCode].push({
            Date: date,
            Opponent: team2.ISOCode,
            Result: `${team1Points}-${team2Points}`
        });

        exhibitions[team2.ISOCode].push({
            Date: date,
            Opponent: team1.ISOCode,
            Result: `${team2Points}-${team1Points}`
        });

        fs.writeFileSync('./data_files/exibitions.json', JSON.stringify(exhibitions, null, 2));
    } catch (error) {
        console.error('Greska pri update-ovanju fajla ', error);
    }
}
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (day && month && year) {
        return new Date(`20${year}-${month}-${day}`);
    }
    else return dateStr;
}
/**
 * Funckija racuna formu na osnovu starosti utakmica iz fajla exhibitions i razlika u poenima
 * @param {*} teams 
 */
function calculateFormu(teams){

    const data = fs.readFileSync('./data_files/exibitions.json', 'utf8');
    const exhibitions= JSON.parse(data);
   
    const danas = new Date();

    teams.forEach(team => {
        const matches = exhibitions[team.ISOCode];
        if (matches && matches.length > 0) {
            let ukupnaRazlika = 0;
           
            let cnt = 0;

            matches.forEach(match => {
                const matchDate = new Date(parseDate(match.Date));
                const dani = Math.floor((danas - matchDate) / (1000 * 60 * 60 * 24));

                const [mojiPoeni, protivnickiPoeni] = match.Result.split('-').map(Number);
                const razlika = mojiPoeni - protivnickiPoeni;
                
                const faktorStarosti = Math.exp((-dani)/30) //opadajuce ali blago opadajuce skalirano sa 30 dana manje od 1

                ukupnaRazlika += (razlika / (mojiPoeni + protivnickiPoeni)) * faktorStarosti; //sto je manja razlika to je prvi cinilac veci
               
                cnt += 1;
            });
        
            team.forma=ukupnaRazlika/cnt 
        } else {
            team.forma = 0; 
        }
    });
   
  }