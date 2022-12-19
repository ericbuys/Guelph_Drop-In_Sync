package event;

import java.util.ArrayList;
import java.io.IOException;
import org.jsoup.nodes.Document;
import org.jsoup.Jsoup;

public class SearchEvent {
    private String eventToSearch;
    private String urlToSearch;
    private ArrayList<Event> eventList;

    public SearchEvent(String eventName, String url) {
        this.eventToSearch = eventName;
        this.urlToSearch = url;
        this.eventList = new ArrayList<Event>();
        
        try {
            parseURL();
        } catch(IOException e) {
            System.out.println(e.getMessage());
        } 
    }

    private void parseURL() throws IOException {
        Document doc = Jsoup.connect(urlToSearch).get();
    }

    public ArrayList<Event> getEventList() {
        return this.eventList;
    }
    
}