public class Event {
    private String eventName;
    private String date;
    private String startTime;
    private String endTime;

    public Event(String eventName, String date, String startTime, String endTime) {
        this.eventName = eventName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getEventName() {
        return this.eventName;
    }

    public String getDate() {
        return this.date;
    }

    public String getStartTime() {
        return this.startTime;
    }

    public String getEndTime() {
        return this.endTime;
    }

    public String setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String setDate(String date) {
        this.date = date;
    }

    public String setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String setEndTime(String endTime) {
        this.endTime = endTime;
    }
}