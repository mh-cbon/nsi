
var quotedValue = function (v, q) {
  q = q || '"'
  if (q==='"') return (v.match(/\s/) ? '"' + v.replace(/"/g, '\\"') + '"' : v)
  else return (v.match(/\s/) ? "'" + v.replace(/'/g, "\\'") + "'" : v)
}

module.exports = quotedValue;
