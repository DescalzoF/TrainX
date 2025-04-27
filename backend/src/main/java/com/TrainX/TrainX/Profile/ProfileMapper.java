package com.TrainX.TrainX.Profile;

import com.TrainX.TrainX.User.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public ProfileDTO toProfileDTO(UserEntity user) {
        if (user == null) {
            return null;
        }

        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setId(user.getId());
        profileDTO.setUsername(user.getUsername());
        profileDTO.setSurname(user.getSurname());
        profileDTO.setEmail(user.getEmail());
        profileDTO.setWeight(user.getWeight());
        profileDTO.setHeight(user.getHeight());
        profileDTO.setAddress(user.getAddress());
        profileDTO.setPhoneNumber(user.getPhoneNumber());
        profileDTO.setAge(user.getAge());
        profileDTO.setSex(user.getSex());
        profileDTO.setUserPhoto(user.getUserPhoto());
        profileDTO.setIsPublic(user.getIsPublic());
        profileDTO.setCoins(user.getCoins());
        return profileDTO;
    }
    public UserEntity updateUserFromDTO(UserEntity user, ProfileDTO profileDTO) {
        if (user == null || profileDTO == null) {
            return user;
        }

        // Only update fields that should be modifiable from profile page
        user.setSurname(profileDTO.getSurname());
        user.setWeight(profileDTO.getWeight());
        user.setHeight(profileDTO.getHeight());
        user.setAddress(profileDTO.getAddress());
        user.setPhoneNumber(profileDTO.getPhoneNumber());
        user.setAge(profileDTO.getAge());
        user.setSex(profileDTO.getSex());
        user.setIsPublic(profileDTO.getIsPublic());

        // Only update user photo if it's provided
        if (profileDTO.getUserPhoto() != null) {
            user.setUserPhoto(profileDTO.getUserPhoto());
        }

        return user;
    }
}