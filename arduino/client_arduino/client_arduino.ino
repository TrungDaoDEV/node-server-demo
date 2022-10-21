#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <SocketIOClient.h>

SocketIOClient client;
//const char *ssid = "123Go";              // Tên mạng Wifi mà Socket server của bạn đang kết nối
//const char *password = "162@BuiTuToan#"; // Pass mạng wifi ahihi, anh em rãnh thì share pass cho mình với.
const char *ssid = "K-Cafe";              // Tên mạng Wifi mà Socket server của bạn đang kết nối
const char *password = "kcafe296"; // Pass mạng wifi ahihi, anh em rãnh thì share pass cho mình với.

//char host[] = "192.168.0.2"; //Địa chỉ IP dịch vụ, hãy thay đổi nó theo địa chỉ IP Socket server của bạn.
char host[] = "192.168.1.39"; //Địa chỉ IP dịch vụ, hãy thay đổi nó theo địa chỉ IP Socket server của bạn.
int port = 3000;                    // Cổng dịch vụ socket server do chúng ta tạo!

// từ khóa extern: dùng để #include các biến toàn cục ở một số thư viện khác. Trong thư viện SocketIOClient có hai biến toàn cục
//  mà chúng ta cần quan tâm đó là
//  RID: Tên hàm (tên sự kiện
//  Rfull: Danh sách biến (được đóng gói lại là chuối JSON)
extern String RID;
extern String Rfull;

// Một số biến dùng cho việc tạo một task
unsigned long previousMillis = 0;
long interval = 2000;

void setup()
{
    // Bật baudrate ở mức 115200 để giao tiếp với máy tính qua Serial
    Serial.begin(115200);
    delay(10);

    // Việc đầu tiên cần làm là kết nối vào mạng Wifi
    Serial.print("Ket noi vao mang ");
    Serial.println(ssid);

    // Kết nối vào mạng Wifi
    WiFi.begin(ssid, password);

    // Chờ đến khi đã được kết nối
    while (WiFi.status() != WL_CONNECTED)
    { // Thoát ra khỏi vòng
        delay(500);
        Serial.print('.');
    }

    Serial.println();
    Serial.println(F("Da ket noi WiFi"));
    Serial.println(F("Di chi IP cua ESP8266 (Socket Client ESP8266): "));
    Serial.println(WiFi.localIP());

    Serial.println(F("0000000000000000!"));
    if (!client.connect(host, port))
    {
        Serial.println(F("Ket noi den socket server that bai!"));
        return;
    }

    Serial.println(F("1111111111111111!"));
    // Khi đã kết nối thành công
    if (client.connected())
    {
        Serial.println(F("Ket noi thành công mà chưa gởi được lệnh!"));
        // Thì gửi sự kiện ("connection") đến Socket server ahihi.
        client.send("connection", "message", "Connected !!!!");
    }
}

void loop()
{
    // tạo một task cứ sau "interval" giây thì chạy lệnh:
    if (millis() - previousMillis > interval)
    {
        // lệnh:
        previousMillis = millis();

        Serial.println(F("22222222222222222!"));
        // gửi sự kiện "atime" là một JSON chứa tham số message có nội dung là Time please?
        client.send("atime", "message", "Time please?");
    }
    // Khi bắt được bất kỳ sự kiện nào thì chúng ta có hai tham số:
    //   +RID: Tên sự kiện
    //   +RFull: Danh sách tham số được nén thành chuỗi JSON!
    if (client.monitor())
    {
        Serial.println(F("33333333333333333!"));
        Serial.println(RID);
        Serial.println(Rfull);
    }
    // Kết nối lại!
    if (!client.connected())
    {
        Serial.println(F("44444444444444444444!"));
        client.reconnect(host, port);
    }
}
