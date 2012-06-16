var module = angular.module("hotify", []);

module.factory('songStore', function ($http, $waitDialog, $log) {
    var readUrl = 'http://172.31.8.13:8080/hotify-server/services/';
    var writeUrl = readUrl;

    function read(key) {
        $waitDialog.show();
        return $http({
            method: 'GET',
            url: readUrl + key
        }).then(function (response) {
            $waitDialog.hide();
            return response.data;
        });
    }

    function write(key, value) {
        $waitDialog.show();
        value = encodeURIComponent(JSON.stringify(value));
        $http({
            method:'JSONP',
            url:writeUrl + key + '=' + value + '&callback=JSON_CALLBACK'
        }).then(function () {
                $waitDialog.hide();
            });
    }

    return {
        read:read,
        write:write
    }
});

module.controller('hotifyController', function ($scope, $navigate, songStore) {
    $scope.storageKey = 'hotify';
    $scope.activeSong = {};
    $scope.songs = [];
    $scope.inputTitle = '';
    $scope.inputArtist = '';

    $scope.addsong = function () {
        $scope.songs.push({
        	title: $scope.inputTitle, 
        	artist: $scope.inputArtist, 
        	thumbnail: '', 
        	genre: '', 
        	done: false});
        $navigate('back');
        $scope.inputTitle = '';
        $scope.inputArtist = '';
        $('#songlist').listview('refresh');
    };
    $scope.showSettings = function () {
        $navigate("#settings");
    };
    $scope.back = function () {
        $navigate('back');
    };
    $scope.refreshActiveSong = function () {
        songStore.read('activesong').then(function (data) {
            if (!data) {
                data = [];
            }
            $scope.activeSong = data;
        });
    };
    $scope.refreshsongs = function () {
        songStore.read('playlistitems').then(function (data) {
            if (!data) {
                data = [];
            }
            $scope.songs = data;
        });
    };
    $scope.savesongs = function () {
        // delete all checked songs
        var newsongs = [], song;
        for (var i = 0; i < $scope.songs.length; i++) {
            song = $scope.songs[i];
            if (!song.done) {
                newsongs.push(song);
            }
        }
        $scope.songs = newsongs;
        songStore.write($scope.storageKey, $scope.songs);
    };

    $scope.refreshActiveSong();
    $scope.refreshsongs();
});