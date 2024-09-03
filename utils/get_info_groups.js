import * as fs from 'fs'
export async function groupsToTeams() {
  return new Promise((resolve, reject) => {
  fs.readFile('./data_files/groups.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.error('Error reading groups.json', err);
      return reject(err);
    }

    try {
      const groups = JSON.parse(jsonString);


      const teams = [];

      for (const group in groups) {

        groups[group].forEach(teamInfo => {
          const team = {
            Team: teamInfo.Team,
            ISOCode: teamInfo.ISOCode,
            FIBARanking: teamInfo.FIBARanking,
            grupa: group,
            poeni: null,
            kosevi: null,
            kos_razlika: null,
            grupni_rank: null,
            disk: false,
          };

          teams.push(team);
        });
      }
      const jsonData = JSON.stringify(teams, null, 2);

      fs.writeFile('./data_files/teams.json', jsonData, (err) => {
        if (err) {
          console.error('Greska pri upisu u teams.json', err);
          return reject(err);
        }
      });
      resolve();

    } catch (err) {
      console.error('Greska pri parsiranju groups.json:', err);
      return reject(err);
    }
  });
});
}