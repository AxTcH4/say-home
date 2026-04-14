package ma.sayhome.say_home_api.matchingEngine.matchRun;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRunRepository extends JpaRepository<MatchRun,Integer> {

    //search for attributes and similar
    //create a percentage column
    //sort by percentage

//sanitize inputs
//trigger a match run
//construct a match result
//store result in match result and send back to front


}
