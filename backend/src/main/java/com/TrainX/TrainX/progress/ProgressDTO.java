package com.TrainX.TrainX.progress;

public class ProgressDTO {
    private String photoOne;
    private String photoTwo;
    private String photoThree;
    private String photoFour;
    private String photoFive;

    public ProgressDTO() {
    }
    public ProgressDTO(String photoOne, String photoTwo, String photoThree, String photoFour, String photoFive) {
        this.photoOne = photoOne;
        this.photoTwo = photoTwo;
        this.photoThree = photoThree;
        this.photoFour = photoFour;
        this.photoFive = photoFive;
    }
    // Getters and Setters
    public String getPhotoOne() {
        return photoOne;
    }
    public void setPhotoOne(String photoOne) {
        this.photoOne = photoOne;
    }
    public String getPhotoTwo() {
        return photoTwo;
    }
    public void setPhotoTwo(String photoTwo) {
        this.photoTwo = photoTwo;
    }
    public String getPhotoThree() {
        return photoThree;
    }
    public void setPhotoThree(String photoThree) {
        this.photoThree = photoThree;
    }
    public String getPhotoFour() {
        return photoFour;
    }
    public void setPhotoFour(String photoFour) {
        this.photoFour = photoFour;
    }
    public String getPhotoFive() {
        return photoFive;
    }
    public void setPhotoFive(String photoFive) {
        this.photoFive = photoFive;
    }
}
