package event;

public class Event {
    private String eventName;
    private String location;
    private String date;
    private String startTime;
    private String endTime;

    public Event(String eventName, String location, String date, String startTime, String endTime) {
        this.eventName = eventName;
        this.location = location;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getEventName() {
        return this.eventName;
    }

    public String getLocation() {
        return this.location;
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

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}