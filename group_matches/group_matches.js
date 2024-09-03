import * as fs from 'fs'
import * as wp from '../utils/match_play.js'

async function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data_files/teams.json', 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      try {
      const teams = JSON.parse(data);
      resolve(teams);
    } catch (error) {
      reject(error);
    }
    });
  })
}

function writeFile(filePath,data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        return reject(err);
      }
      console.log(`Upisani rezultati po grupama u fajl ${filePath}`);
      resolve();
    });
  });
}

async function playKoloForGroup(teams, rankiranja, log, grupePoKolima, kolo) {
  if (teams.length == 0) return;

  const grupa = teams[0].grupa
  const odigraneUtakmice = new Map();
  
  grupePoKolima[grupa]?.forEach(utakmica => {
    if (!odigraneUtakmice.has(utakmica.teamA)) {
      odigraneUtakmice.set(utakmica.teamA, new Set());
    }
    if (!odigraneUtakmice.has(utakmica.teamB)) {
      odigraneUtakmice.set(utakmica.teamB, new Set());
    }
    odigraneUtakmice.get(utakmica.teamA).add(utakmica.teamB);
    odigraneUtakmice.get(utakmica.teamB).add(utakmica.teamA);
  });

  const moguciParovi = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const timA = teams[i];
      const timB = teams[j];

      if (!odigraneUtakmice.get(timA.Team)?.has(timB.Team) && !odigraneUtakmice.get(timB.Team)?.has(timA.Team)) {
        moguciParovi.push([timA, timB]);
      }
    }
  }

  const odabraneUtakmice = [];
  const timoviUTekućemKolu = new Set();

  while (moguciParovi.length > 0 && odabraneUtakmice.length < teams.length / 2) {
    const index = Math.floor(Math.random() * moguciParovi.length);
    const [timA, timB] = moguciParovi.splice(index, 1)[0];

    if (!timoviUTekućemKolu.has(timA.Team) && !timoviUTekućemKolu.has(timB.Team)) {
      odabraneUtakmice.push([timA, timB]);
      timoviUTekućemKolu.add(timA.Team);
      timoviUTekućemKolu.add(timB.Team);
    }
  }
  if (!grupePoKolima[grupa]) {
    grupePoKolima[grupa] = [];
}
  odabraneUtakmice.forEach(([teamA, teamB]) => {

    const result = wp.playGame(teamA, teamB);

    log.push(`    ${teamA.Team} - ${teamB.Team} (${result.team1Res}:${result.team2Res})`);

    grupePoKolima[grupa].push({
      kolo: kolo,
      teamA: teamA.Team,
      teamB: teamB.Team,
      rezultat: `${result.team1Res}:${result.team2Res}`
    });
    rankiranja[teamA.Team].grupa = teamA.grupa;
    rankiranja[teamB.Team].grupa = teamB.grupa;

    rankiranja[teamA.Team].osvojeno += result.team1Res;
    rankiranja[teamA.Team].primljeno += result.team2Res;
    rankiranja[teamA.Team].koseviRazlike += result.team1Res - result.team2Res;

    rankiranja[teamB.Team].osvojeno += result.team2Res;
    rankiranja[teamB.Team].primljeno += result.team1Res;
    rankiranja[teamB.Team].koseviRazlike += result.team2Res - result.team1Res;

    if (result.team1Res > result.team2Res) {
      rankiranja[teamA.Team].pobede += 1;
      rankiranja[teamB.Team].porazi += 1;
    } else {
      rankiranja[teamB.Team].pobede += 1;
      rankiranja[teamA.Team].porazi += 1;
    }

    rankiranja[teamA.Team].poeni = rankiranja[teamA.Team].pobede * 2 + rankiranja[teamA.Team].porazi;
    rankiranja[teamB.Team].poeni = rankiranja[teamB.Team].pobede * 2 + rankiranja[teamB.Team].porazi;
  });
        
    

}

export async function groupMatchesPlay() {
  try {

    const teams = await readFile();

    let rankiranja = {};

    let log = [];

    let grupePoKolima = {};

    teams.forEach(team => {
      rankiranja[team.Team] = {
        grupa: null,
        pobede: 0,
        porazi: 0,
        poeni: 0,
        osvojeno: 0,
        primljeno: 0,
        koseviRazlike: 0
      };
    });

    for (let kolo = 1; kolo <= 3; kolo++) {
      log.push(`\nGrupna faza - ${kolo} kolo:`);
      log.push('\nGrupa A: ');
      await playKoloForGroup(teams.filter(team => team.grupa === 'A'), rankiranja, log, grupePoKolima, kolo);

      log.push('\nGrupa B: ');
      await playKoloForGroup(teams.filter(team => team.grupa === 'B'), rankiranja, log, grupePoKolima, kolo);

      log.push('\nGrupa C: ');
      await playKoloForGroup(teams.filter(team => team.grupa === 'C'), rankiranja, log, grupePoKolima, kolo);
      
    }

      log.push('\nKonačan plasman u grupama:\n');



      const rangiranjeTimova = ['A', 'B', 'C'].flatMap(group => {
        const groupTeams = teams.filter(team => team.grupa === group);
        log.push(`\n  Grupa ${group} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika):\n`);

        //ubaciti medjusobni susret i to
        groupTeams.sort((a, b) => rankiranja[b.Team].poeni - rankiranja[a.Team].poeni ||
            rankiranja[b.Team].koseviRazlike - rankiranja[a.Team].koseviRazlike ||
            rankiranja[b.Team].osvojeno - rankiranja[a.Team].osvojeno);

        groupTeams.forEach((tim,index)=>{
          const r= rankiranja[tim.Team]
          log.push(` ${index + 1}. ${tim.Team} ${r.pobede} / ${r.porazi} / ${r.poeni} / ${r.osvojeno} / ${r.primljeno} / ${r.koseviRazlike > 0 ? '+' : ''}${r.koseviRazlike}`);
          tim.poeni = r.poeni;
          tim.kosevi = r.osvojeno;
          tim.kos_razlika = r.koseviRazlike;
          tim.grupni_rank = index + 1; 
        });
        return groupTeams
    });

    writeFile("./data_files/izvestajGrupnaFaza.json",JSON.stringify(rangiranjeTimova, null, rangiranjeTimova.length))

    const prvoplasirani = rangiranjeTimova.filter(t => t.grupni_rank === 1);
    const drugoplasirani = rangiranjeTimova.filter(t => t.grupni_rank === 2);
    const treceplasirani = rangiranjeTimova.filter(t => t.grupni_rank === 3);
  
    prvoplasirani.sort((a, b) => b.poeni  - a.poeni  || b.kos_razlika - a.kos_razlika || b.kosevi  - a.kosevi );
    drugoplasirani.sort((a, b) => b.poeni  - a.poeni  || b.kos_razlika - a.kos_razlika || b.kosevi  - a.kosevi );
    treceplasirani.sort((a, b) => b.poeni  - a.poeni  || b.kos_razlika - a.kos_razlika || b.kosevi  - a.kosevi );
    
  
    const finalniRang = [...prvoplasirani, ...drugoplasirani, ...treceplasirani];
    
    finalniRang.forEach((team, index) => {
        team.ukupniRang = index + 1; 
    });

    log.push('\nRangiranje timova za eliminacionu fazu:\n');
    for (let i = 0; i < 8; i++) {
            const tim = finalniRang[i];
            log.push(`    ${i + 1}. ${tim.Team} - ${tim.poeni} bodova, Koševi razlika: ${tim.kos_razlika}`);
        
    }
    //writeFile('./data_files/rezultatiGrupe.txt',log.join("\n")); 
    console.log(log.join("\n"))
  
    return finalniRang.slice(0,8);

    }catch (error) {
      console.error(error);
    }

  }
