import * as fs from 'fs'
import * as wp from '../utils/match_play.js'

function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        return reject(err);
      }
      console.log('Upisani rezultati po grupama u fajl' + filePath);
      resolve();
    });
  });
}
export function napraviZreb(timovi) {
  let log = []
  log.push("Timovi u eliminacionoj fazi: ", "\t" + timovi.map(tim => tim.Team).join("; ") + "\n")

  const sesirD = [timovi[0], timovi[1]]
  const sesirE = [timovi[2], timovi[3]]
  const sesirF = [timovi[4], timovi[5]]
  const sesirG = [timovi[6], timovi[7]]

  log.push("  Sesir D")
  log.push("\t\t" + sesirD.map(tim => tim.Team+ " " + tim.grupa).join("\n\t\t"))
  log.push("  Sesir E")
  log.push("\t\t" + sesirE.map(tim => tim.Team + " " + tim.grupa).join("\n\t\t"))
  log.push("  Sesir F")
  log.push("\t\t" + sesirF.map(tim => tim.Team + " " + tim.grupa).join("\n\t\t"))
  log.push("  Sesir G")
  log.push("\t\t" + sesirG.map(tim => tim.Team + " " + tim.grupa).join("\n\t\t"))



  const cetvrtfinale = [];

  if (sesirD[0].grupa == sesirG[0].grupa) {
    cetvrtfinale.push({ team1: sesirD[0], team2: sesirG[1] });
    cetvrtfinale.push({ team1: sesirD[1], team2: sesirG[0] });
  } else {
    if (sesirD[0].grupa == sesirG[1].grupa) {
      cetvrtfinale.push({ team1: sesirD[0], team2: sesirG[0] });
      cetvrtfinale.push({ team1: sesirD[1], team2: sesirG[1] });
    } else {
      if (sesirD[1].grupa == sesirG[0].grupa) {
        cetvrtfinale.push({ team1: sesirD[1], team2: sesirG[1] });
        cetvrtfinale.push({ team1: sesirD[0], team2: sesirG[0] });
      } else {
        if (sesirD[1].grupa == sesirG[1].grupa) {
          cetvrtfinale.push({ team1: sesirD[1], team2: sesirG[0] });
          cetvrtfinale.push({ team1: sesirD[0], team2: sesirG[1] });
        } else { 
          const sesirGpromesan = sesirG.sort(()=>0.5-Math.random())
          cetvrtfinale.push({ team1: sesirD[0], team2: sesirGpromesan[0] });
           cetvrtfinale.push({ team1: sesirD[1], team2: sesirGpromesan[1] });
        }
      }
    }
  }

 
  if (sesirE[0].grupa == sesirF[0].grupa) {
    cetvrtfinale.push({ team1: sesirE[0], team2: sesirF[1] });
    cetvrtfinale.push({ team1: sesirE[1], team2: sesirF[0] });
  } else {
    if (sesirE[0].grupa == sesirF[1].grupa) {
      cetvrtfinale.push({ team1: sesirE[0], team2: sesirF[0] });
      cetvrtfinale.push({ team1: sesirE[1], team2: sesirF[1] });
    } else {
      if (sesirE[1].grupa == sesirF[0].grupa) {
        cetvrtfinale.push({ team1: sesirE[1], team2: sesirF[1] });
        cetvrtfinale.push({ team1: sesirE[0], team2: sesirF[0] });
      } else {
        if (sesirE[1].grupa == sesirF[1].grupa) {
          cetvrtfinale.push({ team1: sesirE[1], team2: sesirF[0] });
          cetvrtfinale.push({ team1: sesirE[0], team2: sesirF[1] });
        } else { 
           const sesirFpromesan = sesirF.sort(()=>0.5-Math.random())
           cetvrtfinale.push({ team1: sesirE[0], team2: sesirFpromesan[0] });
            cetvrtfinale.push({ team1: sesirE[1], team2: sesirFpromesan[1] });
                   
        }
      }
    }
  }

 
  log.push("\nEliminaciona faza")
  log.push("\nCetvrtfinale:\n")
  log.push("\t\t" + cetvrtfinale.map((tim,index) => tim.team1.Team + "-" + tim.team2.Team + (index==1?"\n":"")).join("\n\t\t"))

  const prvaGrupa = cetvrtfinale.slice(0, 2).sort(() => 0.5 - Math.random());
  const drugaGrupa = cetvrtfinale.slice(2, 4).sort(() => 0.5 - Math.random());

  const polufinale = [
    { team1: prvaGrupa[0], team2: drugaGrupa[0] },
    { team1: prvaGrupa[1], team2: drugaGrupa[1] }
  ];

  log.push("\nPolufinale:\n")
      log.push("\t\t"+polufinale.map((tim)=>tim.team1.team1.Team+"-"+tim.team1.team2.Team+" ? "+tim.team2.team1.Team+"-"+tim.team2.team2.Team).join("\n\t\t"))
 // writeFile("./data_files/zreb.txt", log.join("\n"));
 console.log(log.join("\n"))
  return { cetvrtfinale: cetvrtfinale, polufinale: polufinale };
}


export function eliminacionaFaza(zreb) {

  const cetvrtfinale=zreb.cetvrtfinale
  const polufinale= zreb.polufinale

  //cetvrtfilani mecevi 
  let log=["\nCetvrtfinale "]
  let pobednici=[]
  let finalisti=[]
  let trecemesto=[]
  let takmicari=[]
  
  for(let i=0;i<cetvrtfinale.length;i++){
    const teamA=cetvrtfinale[i].team1
    const teamB=cetvrtfinale[i].team2
    const result = wp.playGame(teamA, teamB);

    teamA.kosevi += result.team1Res;
    teamA.kos_razlika += result.team1Res - result.team2Res;

    teamB.kosevi += result.team2Res;
    teamB.kos_razlika += result.team2Res - result.team1Res;

    if (result.team1Res > result.team2Res) {
      teamA.poeni += 2;
      teamB.poeni += 1;
    } else {
      teamB.poeni += 2;
      teamA.poeni += 1;
    }

    
    takmicari.push(teamA)
    takmicari.push(teamB)

    log.push(`    ${teamA.Team} - ${teamB.Team} (${result.team1Res}:${result.team2Res})`);
    if(i==1) log.push(" ")
    pobednici.push( (result.team1Res-result.team2Res)>0 ? teamA:teamB)
  }

writeFile("./data_files/izvestajCetvrtFinale.json",JSON.stringify(takmicari,null,takmicari.length))

log.push("\nPolufinale")
  polufinale.forEach((mecevi)=>{
    const mec1=mecevi.team1 
    const mec2=mecevi.team2
    let prviTim;    
    let drugiTim;
    if(pobednici.indexOf(mec1.team1)!=-1){
      prviTim=mec1.team1
    }else{
      prviTim=mec1.team2
    } 
    if(pobednici.indexOf(mec2.team1)!=-1){
      drugiTim=mec2.team1
    }else{
      drugiTim=mec2.team2
    }
    const result = wp.playGame(prviTim, drugiTim);
    prviTim.kosevi += result.team1Res;
    prviTim.kos_razlika += result.team1Res - result.team2Res;

    drugiTim.kosevi += result.team2Res;
    drugiTim.kos_razlika += result.team2Res - result.team1Res;

    if (result.team1Res > result.team2Res) {
      prviTim.poeni += 2;
      drugiTim.poeni += 1;
    } else {
      drugiTim.poeni += 2;
      prviTim.poeni += 1;
    }
    log.push(`    ${prviTim.Team} - ${drugiTim.Team} (${result.team1Res}:${result.team2Res})`);
   
    finalisti.push( (result.team1Res-result.team2Res)>0 ? prviTim:drugiTim)
    trecemesto.push( (result.team1Res-result.team2Res)<=0 ? prviTim:drugiTim)
 
  })

  

  log.push("\nMec za trece mesto")
  const result1 = wp.playGame(trecemesto[0], trecemesto[1]);

  log.push(`    ${trecemesto[0].Team} - ${trecemesto[1].Team} (${result1.team1Res}:${result1.team2Res})`);

  trecemesto[0].kosevi += result1.team1Res;
  trecemesto[0].kos_razlika += result1.team1Res - result1.team2Res;

  trecemesto[0].ukupniRang=(result1.team1Res - result1.team2Res)>0?3:4;

  trecemesto[1].kosevi += result1.team2Res;
  trecemesto[1].kos_razlika += result1.team2Res - result1.team1Res;

  trecemesto[1].ukupniRang=(result1.team1Res - result1.team2Res)>0?4:3;
  log.push("\nFinale")
  const result2 = wp.playGame(finalisti[0], finalisti[1]);

  log.push(`    ${finalisti[0].Team} - ${finalisti[1].Team} (${result2.team1Res}:${result2.team2Res})`);
  finalisti[0].kosevi += result2.team1Res;
  finalisti[0].kos_razlika += result2.team1Res - result2.team2Res;
  finalisti[0].ukupniRang=(result2.team1Res - result2.team2Res)>0?1:2;

  finalisti[1].kosevi += result2.team2Res;
  finalisti[1].kos_razlika += result2.team2Res - result2.team1Res;
  finalisti[1].ukupniRang=(result2.team1Res - result2.team2Res)<=0?1:2;

  writeFile("./data_files/izvestajPolufinaleFinale.json",JSON.stringify(finalisti.concat(trecemesto).sort((t1,t2)=>t1.ukupniRang-t2.ukupniRang),null,finalisti.length))


  log.push("\nMedalje")
  const medalje=[
    finalisti.filter((t)=>t.ukupniRang==1)[0],
    finalisti.filter((t)=>t.ukupniRang==2)[0],
    trecemesto.filter((t)=>t.ukupniRang==3)[0]
  ]
  log.push(medalje.map((tim,index)=>`${index+1}. ${tim.Team}`).join("\n"))
  //polufinale
  console.log(log.join("\n"))
  //writeFile("./data_files/eliminacionafaza.txt",log.join("\n"))
}