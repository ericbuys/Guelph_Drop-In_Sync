package event;

public class SearchEvent {
    private String eventToSearch;
    private String urlToSearch;

    public SearchEvent(String eventName, String url) {
        this.eventToSearch = eventName;
        this.urlToSearch = url;
    }
}