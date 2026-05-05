try {
  require("./src/server.js");
} catch(e) {
  require("fs").writeFileSync("C:\\Users\\ganesh\\Downloads\\smart_park-main\\backend\\test_result.txt", e.stack || e.message);
}
