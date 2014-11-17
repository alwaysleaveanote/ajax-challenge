"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/

var reviewUrl = 'https://api.parse.com/1/classes/tasks';

angular.module('ajax-challenge', ['ui.bootstrap'])
    .config(function($httpProvider) {
        //Parse required two extra headers sent with every HTTP request: X-Parse-Application-Id, X-Parse-REST-API-Key
        //the first needs to be set to your application's ID value
        //the second needs to be set to your application's REST API key
        //both of these are generated by Parse when you create your application via their web site
        //the following lines will add these as default headers so that they are sent with every
        //HTTP request we make in this application
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'QFRzHr9BSLQ8Bfy74m75aXOEECj9pcwW1c3YK1Zo';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'AXWtvqNk3jjdn0xFBkUtDhoquKzkVkTiZR7JPkni';
    })
    .controller('CommentsController', function($scope, $http) {
    	$scope.compare = function(rev1, rev2) {
    		if (rev1.score > rev2.score) {
    			return -1;
    		} else if (rev1.score < rev2.score) {
    			return 1;
    		} else {
    			return 0;
    		}
    	}

 		$scope.refreshReviews = function() {
            $http.get(reviewUrl + '?where={"deleted":false}')
                .success(function(data) {
                    $scope.reviews = data.results.sort($scope.compare);
                    if($scope.reviews.length == 0) {
                    	document.getElementById('noComments').className = 'noComments';
                    } else {
                    	document.getElementById('noComments').className = 'commentsExist';
                    }
                });
        }

        $scope.refreshReviews();

    	$scope.newReview = {deleted: false};

    	$scope.addComment = function() {
    		$scope.inserting = true;
    		$http.post(reviewUrl, $scope.newReview)
                .success(function(responseData) {
                    $scope.newReview.objectId = responseData.objectId;
                    $scope.reviews.push($scope.newReview);
                    $scope.newReview = {deleted: false};
                })
                .finally(function() {
                    document.getElementById('noComments').className = 'commentsExist';
                    $scope.inserting = false;
                });
            }

        $scope.updateReview = function(review) {
            $http.put(reviewUrl + '/' + review.objectId, review)
                .success(function() {
                    //we could give feedback to user if we wanted
                });
        };

        $scope.incrementVotes = function(review, amount) {
            var postData = {
                score: {
                    __op: "Increment",
                    amount: amount
                }
            };
            $scope.updating = true;
            if (amount == 1 || (amount == -1 && review.score > 0)) {
	            $http.put(reviewUrl + '/' + review.objectId, postData)
	                .success(function(respData) {
	                	if (respData.score >= 0) {
		                    review.score = respData.score;
		                }
	                })
	                .error(function(err) {
	                    console.log(err)
	                })
	                .finally(function() {
	                    $scope.updating = false;
	                })
	            }
            }
        });
