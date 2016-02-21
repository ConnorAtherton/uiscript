const boundaries = {
  // char codes for upper and lowercase letters are the same
  'lowercase': [[65, 90], element => { return element.toLowerCase() }],
  'uppercase': [[65, 90]],
  'numbers': [[48, 57]]
}

let letterCache = {}

//
// TODO: profile if an array or a string in quicker here
//
export default function range(...charSets) {
  let acc = []

  charSets.forEach(set => {
    acc = acc.concat(letterCache[set] || (function() {
      let boundary = boundaries[set]
      let index = boundary[0][0]
      let characters = []

      while (index <= boundary[0][1]) {
        characters.push(String.fromCharCode(index))
        index++
      }

      // check for modification function
      if (typeof boundary[1] === 'function') {
        characters = characters.map(boundary[1])
      }

      letterCache[set] = characters
      return letterCache[set]
    }()))
  })

  return acc.join('')
}
